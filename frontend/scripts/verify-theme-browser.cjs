const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const route = 'http://127.0.0.1:4174/app/configuration/utilisateur/preferences?famille=user-personal';
const restoreOverride = process.argv[2];

async function openThemeDialog(page) {
  const row = page.locator('tr[data-configuration-key="preferences.theme"]');
  await row.waitFor({ timeout: 60000 });
  await row.click();
  await page.locator('.configuration-center__detail-actions button').first().click();
  const dialog = page.getByRole('dialog').filter({ has: page.locator('input[type="radio"][value="dark"]') }).first();
  await dialog.waitFor({ timeout: 30000 });
  return dialog;
}

async function saveTheme(page, dialog, value) {
  await dialog.locator(`input[type="radio"][value="${value}"]`).check();
  const responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'PUT' && response.url().endsWith('/api/v1/configuration/me/theme'),
    { timeout: 30000 },
  );
  await dialog.locator('.configuration-modal__footer button').last().click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`Le thème a été refusé avec le statut ${response.status()}.`);
  await dialog.waitFor({ state: 'detached', timeout: 30000 });
}

function brightness(color) {
  const values = color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
  if (values.length !== 3) return 255;
  return (values[0] * 299 + values[1] * 587 + values[2] * 114) / 1000;
}

async function run() {
  const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'theme-certification');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => {
    window.localStorage.setItem('educsync.frontend.dev-session', JSON.stringify({ actorCode: 'MANAGER_SYSTEME' }));
    window.localStorage.setItem('educsync.frontend.active-context', JSON.stringify({
      governanceLevel: 'PLATEFORME',
      organizationId: 'org-archedu',
      schoolId: 'ecole-saint-raphael',
      schoolYearId: 'annee-saint-raphael-2025-2026',
    }));
  });

  let original = 'system';
  try {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('heading', { name: 'Centre Configuration' }).waitFor({ timeout: 60000 });
    let dialog = await openThemeDialog(page);
    const capturedOriginal = await dialog.locator('input[type="radio"]:checked').inputValue();
    original = ['light', 'dark', 'system'].includes(restoreOverride) ? restoreOverride : capturedOriginal;
    if (capturedOriginal === 'dark') {
      await dialog.locator('.configuration-modal__footer button').first().click();
      await dialog.waitFor({ state: 'detached', timeout: 10000 });
    } else {
      await saveTheme(page, dialog, 'dark');
    }

    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.locator('.configuration-center__list-panel').waitFor({ timeout: 30000 });
    const colors = await page.evaluate(() => {
      const color = (selector) => {
        const element = document.querySelector(selector);
        return element ? getComputedStyle(element).backgroundColor : null;
      };
      return {
        body: getComputedStyle(document.body).backgroundColor,
        shell: color('.erp-shell'),
        topbar: color('.erp-topbar'),
        page: color('.page-container'),
        panel: color('.configuration-center__list-panel'),
      };
    });
    for (const [name, color] of Object.entries(colors)) {
      if (color === null) continue;
      if (brightness(color) > 95) throw new Error(`${name} reste clair après activation du thème sombre (${color}).`);
    }

    await page.screenshot({ path: path.join(artifactDir, 'dark-desktop.png'), fullPage: true });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('heading', { name: 'Centre Configuration' }).waitFor({ timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.screenshot({ path: path.join(artifactDir, 'dark-mobile.png'), fullPage: true });

    dialog = await openThemeDialog(page);
    await saveTheme(page, dialog, original);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    const expected = original === 'dark' ? 'dark' : 'light';
    await page.waitForFunction((theme) => document.documentElement.dataset.theme === theme, expected);
  } finally {
    await browser.close();
  }

  if (errors.length > 0) throw new Error(`Erreurs navigateur: ${errors.join(' | ')}`);
  process.stdout.write('Theme browser verification: OK\n');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
