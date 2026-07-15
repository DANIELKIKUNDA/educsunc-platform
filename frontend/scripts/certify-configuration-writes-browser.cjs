const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const phase = process.argv[2] ?? 'prepare';
const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'configuration-write-certification');
const statePath = path.join(artifactDir, 'state.json');

const settings = [
  ['platform', 'runtime.retry.maxAttempts', 'Paramètres de la plateforme', 'entier'],
  ['platform', 'runtime.replay.enabled', 'Paramètres de la plateforme', 'booléen'],
  ['platform', 'runtime.cache.ttlSeconds', 'Paramètres de la plateforme', 'durée'],
  ['platform', 'notifications.providers.in_app.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.providers.sms.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.providers.email.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.providers.whatsapp.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.providers.push.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.providers.webhook.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.retry.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.retry.maxAttempts', 'Diffusion des notifications', 'entier'],
  ['platform', 'notifications.retry.defaultBackoffMs', 'Diffusion des notifications', 'durée'],
  ['platform', 'notifications.replay.enabled', 'Diffusion des notifications', 'booléen'],
  ['platform', 'notifications.replay.batchSize', 'Diffusion des notifications', 'entier'],
  ['user', 'preferences.theme', 'Préférences personnelles', 'choix unique'],
  ['user', 'notifications.preferences.muted', 'Préférences personnelles', 'booléen'],
  ['user', 'notifications.preferences.preferredChannel', 'Préférences personnelles', 'choix unique'],
  ['user', 'notifications.preferences.enabledChannels', 'Préférences personnelles', 'choix multiple'],
].map(([level, key, family, type]) => ({ level, key, family, type }));

function saveState(state) {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function equalValues(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
  }
  return left === right;
}

async function openCenter(page, level) {
  const route = level === 'user'
    ? 'http://127.0.0.1:4174/app/configuration/utilisateur/preferences?famille=user-personal'
    : 'http://127.0.0.1:4174/app/configuration/plateforme/runtime';
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('heading', { name: 'Centre Configuration' }).waitFor({ timeout: 60000 });
  await page.locator('tr[data-configuration-key]').first().waitFor({ timeout: 60000 });
  if (await page.getByText('Centre indisponible', { exact: true }).count()) {
    throw new Error(`Le Centre Configuration est indisponible au niveau ${level}.`);
  }
}

async function openSetting(page, key) {
  const row = page.locator(`tr[data-configuration-key="${key}"]`);
  await row.waitFor({ timeout: 30000 });
  await row.click();
  const action = page.locator('.configuration-center__detail-actions button').first();
  await action.waitFor({ timeout: 30000 });
  await action.click();
  const dialog = page.getByRole('dialog').filter({ has: page.locator('.configuration-center__modal-grid') }).first();
  await dialog.waitFor({ timeout: 30000 });
  return dialog;
}

async function readControl(dialog) {
  const numeric = dialog.locator('input[type="number"]');
  if (await numeric.count()) return Number(await numeric.inputValue());

  const toggle = dialog.locator('.configuration-center__switch input[type="checkbox"]');
  if (await toggle.count()) return toggle.isChecked();

  const radios = dialog.locator('input[type="radio"]');
  if (await radios.count()) return dialog.locator('input[type="radio"]:checked').inputValue();

  const select = dialog.locator('select');
  if (await select.count()) return select.inputValue();

  const multi = dialog.locator('.configuration-center__choice-row--wrap input[type="checkbox"]');
  if (await multi.count()) {
    const values = [];
    for (let index = 0; index < await multi.count(); index += 1) {
      const input = multi.nth(index);
      if (await input.isChecked()) values.push(await input.getAttribute('value'));
    }
    return values.filter(Boolean);
  }

  const text = dialog.locator('input[type="text"], textarea').first();
  if (await text.count()) return text.inputValue();
  throw new Error('Aucun contrôle de saisie reconnu dans la fenêtre.');
}

async function alternativeValue(dialog, original) {
  const numeric = dialog.locator('input[type="number"]');
  if (await numeric.count()) {
    const minimum = Number(await numeric.getAttribute('min'));
    const maximum = Number(await numeric.getAttribute('max'));
    const step = Number(await numeric.getAttribute('step')) || 1;
    return original + step <= maximum ? original + step : Math.max(minimum, original - step);
  }
  if (typeof original === 'boolean') return !original;

  const radios = dialog.locator('input[type="radio"]');
  if (await radios.count()) {
    const values = await radios.evaluateAll((nodes) => nodes.map((node) => node.value));
    return values.find((value) => value !== original);
  }

  const select = dialog.locator('select');
  if (await select.count()) {
    const values = await select.locator('option:not([disabled])').evaluateAll((nodes) => nodes.map((node) => node.value));
    return values.find((value) => value !== original);
  }

  if (Array.isArray(original)) {
    const inputs = dialog.locator('.configuration-center__choice-row--wrap input[type="checkbox"]');
    const values = (await inputs.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('value')))).filter(Boolean);
    const candidate = values[0];
    return original.includes(candidate)
      ? original.filter((value) => value !== candidate)
      : [...original, candidate];
  }
  return `${original}-test`;
}

async function fillControl(dialog, value) {
  const numeric = dialog.locator('input[type="number"]');
  if (await numeric.count()) return numeric.fill(String(value));

  const toggle = dialog.locator('.configuration-center__switch input[type="checkbox"]');
  if (await toggle.count()) {
    if (await toggle.isChecked() !== Boolean(value)) {
      await dialog.locator('.configuration-center__switch').click();
    }
    return;
  }

  const radios = dialog.locator('input[type="radio"]');
  if (await radios.count()) return dialog.locator(`input[type="radio"][value="${value}"]`).check();

  const select = dialog.locator('select');
  if (await select.count()) return select.selectOption(String(value));

  const multi = dialog.locator('.configuration-center__choice-row--wrap input[type="checkbox"]');
  if (await multi.count()) {
    for (let index = 0; index < await multi.count(); index += 1) {
      const input = multi.nth(index);
      await input.setChecked(value.includes(await input.getAttribute('value')), { force: true });
    }
    return;
  }

  return dialog.locator('input[type="text"], textarea').first().fill(String(value));
}

async function saveAndWait(page, dialog) {
  const submit = dialog.locator('.configuration-modal__footer button').last();
  if (await submit.isDisabled()) throw new Error('Le bouton d’enregistrement reste désactivé avec une valeur valide.');
  const responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'PUT' && response.url().includes('/api/v1/configuration/'),
    { timeout: 30000 },
  );
  await submit.click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`Écriture refusée avec le statut ${response.status()}.`);
  await dialog.waitFor({ state: 'detached', timeout: 30000 });
  return response.status();
}

async function readSetting(page, key) {
  const dialog = await openSetting(page, key);
  const value = await readControl(dialog);
  await dialog.locator('.configuration-modal__footer button').first().click();
  await dialog.waitFor({ state: 'detached', timeout: 10000 });
  return value;
}

async function writeSetting(page, key, value) {
  const dialog = await openSetting(page, key);
  await fillControl(dialog, value);
  return saveAndWait(page, dialog);
}

async function prepare(page) {
  const state = { preparedAt: new Date().toISOString(), completed: false, restored: false, records: [] };
  saveState(state);
  let currentLevel = null;

  try {
    for (const setting of settings) {
      if (setting.level !== currentLevel) {
        await openCenter(page, setting.level);
        currentLevel = setting.level;
      }
      const dialog = await openSetting(page, setting.key);
      const original = await readControl(dialog);
      const testValue = await alternativeValue(dialog, original);
      await fillControl(dialog, testValue);
      const httpStatus = await saveAndWait(page, dialog);

      await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.locator(`tr[data-configuration-key="${setting.key}"]`).waitFor({ timeout: 60000 });
      const afterRefresh = await readSetting(page, setting.key);
      const record = { ...setting, initialValue: original, testValue, httpStatus, afterRefresh, afterRestart: null, restoredValue: null, status: equalValues(testValue, afterRefresh) ? 'ACTUALISATION_OK' : 'ECHEC_ACTUALISATION' };
      state.records.push(record);
      saveState(state);
      if (record.status !== 'ACTUALISATION_OK') throw new Error(`${setting.key}: valeur perdue après actualisation.`);
      process.stdout.write(`PREPARE OK ${setting.key}\n`);
    }
    state.completed = true;
    saveState(state);
  } catch (error) {
    saveState(state);
    throw error;
  }
}

async function verifyAndRestore(page) {
  if (!fs.existsSync(statePath)) throw new Error('État de préparation introuvable.');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  if (!state.completed) throw new Error('La phase de préparation n’est pas complète.');
  let currentLevel = null;

  for (const record of state.records) {
    if (record.level !== currentLevel) {
      await openCenter(page, record.level);
      currentLevel = record.level;
    }
    record.afterRestart = await readSetting(page, record.key);
    if (!equalValues(record.testValue, record.afterRestart)) {
      record.status = 'ECHEC_REDEMARRAGE';
      saveState(state);
      throw new Error(`${record.key}: valeur perdue après redémarrage.`);
    }

    await writeSetting(page, record.key, record.initialValue);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.locator(`tr[data-configuration-key="${record.key}"]`).waitFor({ timeout: 60000 });
    record.restoredValue = await readSetting(page, record.key);
    record.status = equalValues(record.initialValue, record.restoredValue) ? 'CERTIFIE' : 'ECHEC_RESTAURATION';
    saveState(state);
    if (record.status !== 'CERTIFIE') throw new Error(`${record.key}: restauration incomplète.`);
    process.stdout.write(`CERTIFIE ${record.key}\n`);
  }

  state.restored = true;
  state.certifiedAt = new Date().toISOString();
  saveState(state);
}

async function run() {
  if (!['prepare', 'verify-restore'].includes(phase)) throw new Error(`Phase inconnue: ${phase}`);
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
  await page.addInitScript(() => {
    window.localStorage.setItem('educsync.frontend.dev-session', JSON.stringify({ actorCode: 'MANAGER_SYSTEME' }));
    window.localStorage.setItem('educsync.frontend.active-context', JSON.stringify({
      governanceLevel: 'PLATEFORME',
      organizationId: 'org-archedu',
      schoolId: 'ecole-saint-raphael',
      schoolYearId: 'annee-saint-raphael-2025-2026',
    }));
  });

  try {
    if (phase === 'prepare') await prepare(page);
    else await verifyAndRestore(page);
  } finally {
    await page.screenshot({ path: path.join(artifactDir, `${phase}.png`), fullPage: true }).catch(() => undefined);
    await browser.close();
  }

  if (runtimeErrors.length > 0) throw new Error(`Erreurs navigateur: ${runtimeErrors.join(' | ')}`);
  process.stdout.write(`Configuration write certification ${phase}: OK\n`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
