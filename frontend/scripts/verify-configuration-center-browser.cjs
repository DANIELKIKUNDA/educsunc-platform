const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

async function run() {
  process.stdout.write('browser: launch\n');
  const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'configuration-step-f');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  process.stdout.write('browser: opened\n');
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => {
    window.localStorage.setItem('educsync.frontend.dev-session', JSON.stringify({ actorCode: 'MANAGER_SYSTEME' }));
    window.localStorage.setItem('educsync.frontend.active-context', JSON.stringify({
      governanceLevel: 'PLATEFORME',
      organizationId: 'org-archedu',
      schoolId: 'ecole-saint-raphael',
      schoolYearId: 'annee-saint-raphael-2025-2026',
    }));
  });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto('http://127.0.0.1:4174/app/configuration/plateforme/runtime', { waitUntil: 'domcontentloaded', timeout: 120000 });
  process.stdout.write('browser: page loaded\n');
  await page.getByRole('heading', { name: 'Centre Configuration' }).waitFor({ timeout: 60000 });
  await page.getByText('Tentatives de reprise', { exact: true }).first().waitFor({ timeout: 60000 });
  process.stdout.write('browser: settings visible\n');
  if (await page.getByText('Centre indisponible', { exact: true }).count()) throw new Error('Le Centre Configuration est indisponible.');
  if (await page.getByText('Accès refusé', { exact: true }).count()) throw new Error('Le Manager Système est refusé à tort.');

  await page.getByText('Tentatives de reprise', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Modifier tentatives de reprise' }).first().click();
  const actionDialog = page.getByRole('dialog', { name: /Modifier ce réglage/ });
  await actionDialog.waitFor();
  const numericInput = actionDialog.locator('input[type="number"]');
  await numericInput.fill('4');
  const saveButton = actionDialog.getByRole('button', { name: 'Modifier tentatives de reprise' });
  if (await saveButton.isDisabled()) throw new Error('Le bouton reste désactivé avec une valeur entière valide.');

  await actionDialog.getByRole('button', { name: 'Annuler' }).click();
  const discardDialog = page.getByRole('dialog', { name: 'Quitter sans enregistrer ?' });
  await discardDialog.waitFor();
  await discardDialog.getByRole('button', { name: 'Continuer la modification' }).click();
  await actionDialog.waitFor();
  await actionDialog.getByRole('button', { name: 'Annuler' }).click();
  await discardDialog.getByRole('button', { name: 'Quitter sans enregistrer' }).click();
  await actionDialog.waitFor({ state: 'detached' });
  process.stdout.write('browser: modal workflow verified\n');

  await page.getByRole('button', { name: /Préférences personnelles/ }).first().click();
  await page.getByText("Thème de l'espace personnel", { exact: true }).first().waitFor();
  const userPreferencesText = await page.locator('body').innerText();
  if (/(^|\n)(system|true|false|IN_APP|EMAIL|USER)(\n|$)/m.test(userPreferencesText)) {
    throw new Error('Une valeur technique brute reste visible dans les préférences personnelles.');
  }
  if (/\[\s*"(?:IN_APP|EMAIL|SMS|PUSH|WEBHOOK)/.test(userPreferencesText)) {
    throw new Error('Une liste JSON brute reste visible dans les préférences personnelles.');
  }
  process.stdout.write('browser: user-friendly values verified\n');

  const desktopLayout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollX: window.scrollX,
  }));
  if (desktopLayout.scrollWidth > desktopLayout.clientWidth + 1) {
    throw new Error(`Le Centre Configuration déborde sur desktop (${desktopLayout.scrollWidth}px pour ${desktopLayout.clientWidth}px).`);
  }
  if (desktopLayout.scrollX !== 0) window.scrollTo(0, 0);

  await page.screenshot({ path: path.join(artifactDir, 'desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('heading', { name: 'Centre Configuration' }).waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) throw new Error('Le Centre Configuration déborde horizontalement sur mobile.');
  await page.screenshot({ path: path.join(artifactDir, 'mobile.png'), fullPage: true });
  process.stdout.write('browser: responsive verified\n');

  await browser.close();
  if (runtimeErrors.length > 0) throw new Error(`Erreurs navigateur: ${runtimeErrors.join(' | ')}`);
  process.stdout.write('Configuration Center browser verification: OK\n');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
