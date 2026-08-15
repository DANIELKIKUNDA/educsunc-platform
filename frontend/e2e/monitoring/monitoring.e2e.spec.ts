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

async function ouvrirEcranMonitoring(
  page: Parameters<typeof openRealDeveloperSession>[0],
  path: string,
  heading: string,
): Promise<void> {
  const link = page.locator(`a[href="${path}"]`).first();
  if (!await link.isVisible()) {
    await page.getByRole('button', { name: /^Monitoring\b/ }).click();
  }
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  await expect(page.getByRole('heading', { name: heading, exact: true, level: 1 })).toBeVisible();
}

for (const actor of ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME'] as const) {
  test(`${actor} accede au cockpit Monitoring et aux ecrans operationnels`, async ({ page }) => {
    const profile = await openRealDeveloperSession(page, actor);
    expect(profile.contexte.governanceLevel).toBe('PLATEFORME');
    expect(profile.permissionsEffectives).toContain('monitoring.read');
    for (const [path, heading] of readScreens) {
      await ouvrirEcranMonitoring(page, path, heading);
    }
  });
}

test('SUPPORT_SYSTEME lit Monitoring mais ne voit aucune mutation', async ({ page }) => {
  const profile = await openRealDeveloperSession(page, 'SUPPORT_SYSTEME');
  expect(profile.contexte.governanceLevel).toBe('PLATEFORME');
  await ouvrirEcranMonitoring(page, '/app/monitoring/alertes', 'Alertes monitoring');
  await expect(page.getByRole('heading', { name: 'Creer une alerte' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Resoudre/i })).toHaveCount(0);
  await ouvrirEcranMonitoring(page, '/app/monitoring/incidents', 'Incidents monitoring');
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
  await ouvrirEcranMonitoring(page, '/app/monitoring/dashboard', 'Dashboard monitoring');
  await expect(page.getByText('Vue operationnelle', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    const originalFetch = window.fetch.bind(window);
    const probe = { interceptee: false };
    Object.defineProperty(window, '__monitoringNetworkProbe', {
      configurable: true,
      value: probe,
    });
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const rawUrl = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      const pathname = new URL(rawUrl, window.location.href).pathname;
      if (pathname === '/api/v1/monitoring/dashboard') {
        probe.interceptee = true;
        return Promise.reject(new TypeError('Failed to fetch'));
      }
      return originalFetch(input, init);
    };
  });
  await page.getByRole('button', { name: 'Rafraichir' }).click();
  await expect.poll(() => page.evaluate(() => (
    window as Window & { __monitoringNetworkProbe?: { interceptee: boolean } }
  ).__monitoringNetworkProbe?.interceptee ?? false)).toBe(true);
  await expect(page.getByText('Lecture monitoring impossible', { exact: true })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('.erp-shell')).toBeVisible();
});
