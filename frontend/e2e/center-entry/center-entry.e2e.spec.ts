import { expect, test } from '@playwright/test';
import { openRealDeveloperSession } from '../g1/helpers/g1-session';

test('les entrees principales ouvrent les centres industrialises', async ({ page }) => {
  await openRealDeveloperSession(page, 'MANAGER_SYSTEME');

  await page.goto('/app/notifications', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Centre Notifications', level: 1 })).toBeVisible();
  await expect(page.getByText('NOTIF-HOME', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Une diffusion gouvern.e au plus pr.s des .tablissements/i })).toBeVisible();

  await page.goto('/app/audit', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/app\/audit\/plateforme$/);
  await expect(page.getByRole('heading', { name: 'Centre Audit', level: 1 })).toBeVisible();

  await page.goto('/app/monitoring', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/app\/monitoring$/);
  await expect(page.getByRole('heading', { name: 'Centre Monitoring', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vue operationnelle' })).toBeVisible();
  await expect(page.getByText('Poste de supervision', { exact: true })).toHaveCount(0);
});
