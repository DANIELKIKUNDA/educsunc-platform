import { expect, test } from '@playwright/test';
import { openRealDeveloperSession, observeRequests } from '../g1/helpers/g1-session';

const readScreens = [
  ['/app/monitoring/dashboard', 'Dashboard monitoring'],
  ['/app/monitoring/sante', 'Sante systeme'],
  ['/app/monitoring/alertes', 'Alertes monitoring'],
  ['/app/monitoring/incidents', 'Incidents monitoring'],
  ['/app/monitoring/diagnostics', 'Diagnostics'],
  ['/app/monitoring/capacite', 'Capacite et saturation'],
  ['/app/monitoring/traces', 'Traces monitoring'],
] as const;

for (const actor of ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'] as const) {
  test(`${actor} accede au cockpit Monitoring et aux ecrans operationnels`, async ({ page }) => {
    const profile = await openRealDeveloperSession(page, actor);
    expect(profile.contexte.governanceLevel).toBe('PLATEFORME');
    expect(profile.permissionsEffectives).toContain('monitoring.read');
    for (const [path, heading] of readScreens) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    }
  });
}

test('SUPPORT_SYSTEME lit Monitoring mais ne voit aucune mutation', async ({ page }) => {
  const profile = await openRealDeveloperSession(page, 'SUPPORT_SYSTEME');
  expect(profile.contexte.governanceLevel).toBe('PLATEFORME');
  await page.goto('/app/monitoring/alertes', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Alertes monitoring' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Creer une alerte' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Resoudre/i })).toHaveCount(0);
  await page.goto('/app/monitoring/incidents', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Ouvrir un incident' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Escalader/i })).toHaveCount(0);
});

test('acteur Ecole ne peut ni afficher Monitoring ni appeler son API par navigation', async ({ page }) => {
  const profile = await openRealDeveloperSession(page, 'CAISSIER');
  expect(profile.contexte.governanceLevel).toBe('ECOLE');
  const calls = observeRequests(page, (url) => url.pathname.startsWith('/api/v1/monitoring'));
  await page.goto('/app/monitoring/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).not.toHaveURL(/\/app\/monitoring\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard monitoring' })).toHaveCount(0);
  expect(calls).toHaveLength(0);
});

test('erreur reseau Monitoring reste contenue dans le cockpit', async ({ page }) => {
  await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
  await page.goto('/app/monitoring/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Dashboard monitoring' })).toBeVisible();
  await page.getByRole('link', { name: 'Retour monitoring' }).click();
  await expect(page).toHaveURL(/\/app\/monitoring$/);
  await expect(page.getByRole('heading', { name: 'Centre Monitoring' })).toBeVisible();

  let requeteInterceptee = false;
  await page.route('**/api/v1/monitoring/dashboard*', (route) => {
    requeteInterceptee = true;
    return route.abort('internetdisconnected');
  });
  await page.getByRole('link', { name: 'Ouvrir le dashboard' }).click();
  await expect(page).toHaveURL(/\/app\/monitoring\/dashboard$/);
  await page.getByRole('button', { name: 'Rafraichir' }).click();
  await expect.poll(() => requeteInterceptee).toBe(true);
  await expect(page.getByRole('heading', { name: 'Lecture monitoring impossible' })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('.erp-shell')).toBeVisible();
});
