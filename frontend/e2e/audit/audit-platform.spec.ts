import { expect, test, type Page, type Response } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { observeRequests, openRealDeveloperSession, type G1ActorCode } from '../g1/helpers/g1-session';

const auditListPath = '/api/v1/audit';

async function openAudit(page: Page, actor: G1ActorCode = 'MANAGER_SYSTEME'): Promise<Response> {
  await openRealDeveloperSession(page, actor);
  const response = page.waitForResponse((candidate) => candidate.request().method() === 'GET' && new URL(candidate.url()).pathname === auditListPath);
  await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
  const result = await response;
  expect(result.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Centre Audit' })).toBeVisible();
  return result;
}

test.describe.serial('L6 - Centre Audit Plateforme', () => {
  test('01 - Manager Système ouvre le Centre Audit', async ({ page }) => {
    await openAudit(page);
    await expect(page.getByText('Plateforme EduSync')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Journal des événements' })).toBeVisible();
  });

  test('02 - le journal relit PostgreSQL sans injecter de tenant actif', async ({ page }) => {
    await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
    const requests = observeRequests(page, (url, method) => method === 'GET' && url.pathname === auditListPath);
    const response = page.waitForResponse((candidate) => new URL(candidate.url()).pathname === auditListPath);
    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    expect((await response).ok()).toBeTruthy();
    expect(requests.length).toBeGreaterThan(0);
    for (const request of requests) {
      expect(request.headers.authorization).toMatch(/^Bearer /);
      expect(request.headers['x-organisation-id']).toBeUndefined();
      expect(request.headers['x-tenant-id']).toBeUndefined();
      expect(request.headers['x-ecole-id']).toBeUndefined();
    }
  });

  test('03 - les filtres structurés sont transmis au serveur', async ({ page }) => {
    await openAudit(page);
    await page.getByLabel('Gravité').selectOption('CRITIQUE');
    await page.getByLabel('Résultat').selectOption('FAILED');
    const response = page.waitForResponse((candidate) => {
      const url = new URL(candidate.url());
      return url.pathname === auditListPath && url.searchParams.get('gravite') === 'CRITIQUE' && url.searchParams.get('resultat') === 'FAILED';
    });
    await page.getByRole('button', { name: 'Appliquer' }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(page.getByText('Gravité: CRITIQUE')).toBeVisible();
  });

  test('04 - un détail réel s’ouvre dans une modale accessible', async ({ page }) => {
    await openAudit(page);
    const detail = page.getByRole('button', { name: /Ouvrir le détail de/i }).first();
    await expect(detail).toBeVisible();
    const response = page.waitForResponse((candidate) => /\/api\/v1\/audit\/[^/]+$/.test(new URL(candidate.url()).pathname));
    await detail.click();
    expect((await response).ok()).toBeTruthy();
    await expect(page.getByRole('dialog', { name: 'Détail de l’événement d’audit' })).toBeVisible();
    await expect(page).toHaveURL(/\/app\/audit\/plateforme\/evenements\//);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Détail de l’événement d’audit' })).toBeHidden();
  });

  test('05 - la pagination utilise uniquement le curseur opaque du serveur', async ({ page }) => {
    await openAudit(page);
    const button = page.getByRole('button', { name: 'Charger la suite' });
    await expect(button).toBeVisible();
    const response = page.waitForResponse((candidate) => new URL(candidate.url()).pathname === auditListPath && new URL(candidate.url()).searchParams.has('cursor'));
    await button.click();
    const url = new URL((await response).url());
    expect(url.searchParams.get('cursor')).toBeTruthy();
    expect(url.searchParams.has('page')).toBeFalsy();
    expect(url.searchParams.has('offset')).toBeFalsy();
  });

  test('06 - Manager demande un export réel', async ({ page }) => {
    await openAudit(page);
    const response = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/api/v1/exports/audit');
    await page.getByRole('button', { name: 'Demander l’export' }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(page.getByRole('tab', { name: /Exports/i })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Exports de cette session')).toBeVisible();
  });

  test('07 - le statut d’un export est relu depuis le serveur', async ({ page }) => {
    await openAudit(page);
    const created = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/api/v1/exports/audit');
    await page.getByRole('button', { name: 'Demander l’export' }).click();
    expect((await created).ok()).toBeTruthy();
    const status = page.waitForResponse((candidate) => /\/api\/v1\/exports\/[^/]+\/status$/.test(new URL(candidate.url()).pathname));
    await page.getByRole('button', { name: 'Actualiser' }).last().click();
    expect((await status).ok()).toBeTruthy();
  });

  test('08 - un export terminé se télécharge par la route authentifiée', async ({ page }) => {
    await openAudit(page);
    const created = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/api/v1/exports/audit');
    await page.getByRole('button', { name: 'Demander l’export' }).click();
    expect((await created).ok()).toBeTruthy();
    for (let attempt = 0; attempt < 30 && await page.getByRole('button', { name: 'Télécharger' }).count() === 0; attempt += 1) {
      const status = page.waitForResponse((candidate) => /\/api\/v1\/exports\/[^/]+\/status$/.test(new URL(candidate.url()).pathname));
      await page.getByRole('button', { name: 'Actualiser' }).last().click();
      await status;
      await page.waitForTimeout(500);
    }
    const downloadButton = page.getByRole('button', { name: 'Télécharger' });
    await expect(downloadButton).toBeVisible();
    const download = page.waitForEvent('download');
    await downloadButton.click();
    expect((await download).suggestedFilename()).toBeTruthy();
  });

  test('09 - l’export forensic utilise la capacité officielle', async ({ page }) => {
    await openAudit(page);
    const response = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/api/v1/exports/forensic');
    await page.getByRole('button', { name: 'Exporter l’investigation' }).click();
    expect((await response).ok()).toBeTruthy();
  });

  test('10 - le contrôle d’intégrité d’un événement consomme le résultat serveur', async ({ page }) => {
    await openAudit(page);
    const detail = page.getByRole('button', { name: /Ouvrir le détail de/i }).first();
    await expect(detail).toBeVisible();
    await detail.click();
    const response = page.waitForResponse((candidate) => /\/api\/v1\/security\/integrity\/[^/]+$/.test(new URL(candidate.url()).pathname));
    await page.getByRole('button', { name: 'Vérifier l’intégrité' }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(page.getByText(/Intégrité:/)).toBeVisible();
  });

  test('11 - le replay commence par une simulation confirmée', async ({ page }) => {
    await openAudit(page);
    await page.getByRole('button', { name: 'Préparer la reconstruction' }).click();
    await page.getByLabel('Justification').fill('Certification L6 de la simulation de reconstruction');
    const response = page.waitForResponse((candidate) => candidate.request().method() === 'POST' && new URL(candidate.url()).pathname === '/api/v1/replay/projections');
    await page.getByRole('button', { name: 'Vérifier l’impact' }).click();
    expect((await response).ok()).toBeTruthy();
    await expect(page.getByText('Simulation terminée')).toBeVisible();
  });

  test('12 - Support Système reste en lecture sans mutations avancées', async ({ page }) => {
    await openAudit(page, 'SUPPORT_SYSTEME');
    await expect(page.getByRole('button', { name: 'Demander l’export' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Préparer la reconstruction' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Gérer la conservation' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Préparer le contrôle' })).toHaveCount(0);
  });

  test('13 - un rôle Organisation ne charge pas le Centre Audit Plateforme', async ({ page }) => {
    await openRealDeveloperSession(page, 'PROMOTEUR_ORGANISATION');
    const calls = observeRequests(page, (url) => url.pathname === auditListPath);
    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/app\/audit\/plateforme$/);
    expect(calls).toHaveLength(0);
  });

  test('14 - un rôle École ne charge pas le Centre Audit Plateforme', async ({ page }) => {
    await openRealDeveloperSession(page, 'CAISSIER');
    const calls = observeRequests(page, (url) => url.pathname === auditListPath);
    await page.goto('/app/audit/plateforme', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/app\/audit\/plateforme$/);
    expect(calls).toHaveLength(0);
  });

  test('15 - une URL directe vers un événement inexistant reste sûre', async ({ page }) => {
    await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
    const foreignId = randomUUID();
    const response = page.waitForResponse((candidate) => new URL(candidate.url()).pathname === `/api/v1/audit/${foreignId}`);
    await page.goto(`/app/audit/plateforme/evenements/${foreignId}`, { waitUntil: 'domcontentloaded' });
    expect((await response).status()).toBe(404);
    await expect(page.getByText('Détail indisponible')).toBeVisible();
    await expect(page.getByText(/stack trace|sqlstate|select .* from/i)).toHaveCount(0);
  });

  test('16 - une erreur métier reste humaine et permet de réessayer', async ({ page }) => {
    await openAudit(page);
    await page.getByRole('textbox', { name: 'Du', exact: true }).fill('2030-01-02');
    await page.getByRole('textbox', { name: 'Au', exact: true }).fill('2030-01-01');
    await page.getByRole('button', { name: 'Appliquer' }).click();
    await expect(page.getByText('Journal indisponible')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
    await expect(page.getByText(/stack trace|sqlstate|select .* from/i)).toHaveCount(0);
  });

  test('17 - un filtre sans résultat affiche un état vide métier', async ({ page }) => {
    await openAudit(page);
    await page.getByLabel('Action').fill(`ACTION_ABSENTE_${randomUUID()}`);
    await page.getByRole('button', { name: 'Appliquer' }).click();
    await expect(page.getByText('Aucun événement trouvé')).toBeVisible();
  });

  test('18 - le centre reste exploitable sur tablette et dataset progressif', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 1000 });
    await openAudit(page);
    await expect(page.locator('.audit-center')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('.audit-journal__mobile')).toBeVisible();
  });
});
