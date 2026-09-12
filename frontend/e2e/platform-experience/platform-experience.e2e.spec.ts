import { expect, test } from '@playwright/test';
import { openRealDeveloperSession, type G1ActorCode } from '../g1/helpers/g1-session';

const actorCockpits: ReadonlyArray<{
  actor: G1ActorCode;
  title: string;
}> = [
  { actor: 'MANAGER_SYSTEME', title: 'Vue exécutive de la plateforme' },
  { actor: 'OPERATEUR_SYSTEME', title: 'Exploitation de la plateforme' },
  { actor: 'SUPPORT_SYSTEME', title: 'Diagnostic de la plateforme' },
];

for (const cockpit of actorCockpits) {
  test(`${cockpit.actor} dispose de son cockpit réel`, async ({ page }) => {
    await openRealDeveloperSession(page, cockpit.actor);
    await page.goto('/app/plateforme', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: cockpit.title, level: 1 })).toBeVisible();
    await expect(page.locator('.erp-sidebar__group-label').first()).toBeVisible();
    await expect(page.getByText('Messages', { exact: true })).toHaveCount(0);
    await expect(page.locator('.erp-topbar__count')).toHaveCount(0);
    if (cockpit.actor === 'MANAGER_SYSTEME') {
      for (const group of ['Pilotage', 'Opérations', 'Gouvernance', 'Système']) {
        await expect(page.locator('.erp-sidebar__group-label', { hasText: group })).toBeVisible();
      }
    }
  });
}

test('la recherche globale est accessible au clavier', async ({ page }) => {
  await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
  await page.goto('/app/plateforme', { waitUntil: 'domcontentloaded' });

  const globalSearch = page.locator('.erp-topbar__search input');
  await expect(globalSearch).toBeVisible();
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }));
  });
  await expect(globalSearch).toBeFocused();
});

for (const viewport of [
  { name: 'tablette', width: 900, height: 1100 },
  { name: 'mobile', width: 390, height: 844 },
] as const) {
  test(`la navigation ${viewport.name} reste exploitable`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openRealDeveloperSession(page, 'MANAGER_SYSTEME');
    await page.goto('/app/plateforme', { waitUntil: 'domcontentloaded' });

    const bottomNavigation = page.getByRole('navigation', { name: 'Navigation principale mobile' });
    await expect(bottomNavigation).toBeVisible();
    await bottomNavigation.getByRole('button', { name: 'Ouvrir tous les espaces' }).click();
    await expect(page.locator('.erp-drawer__panel')).toBeVisible();
    await expect(page.locator('.erp-drawer__group-label', { hasText: 'Pilotage' })).toBeVisible();
  });
}
