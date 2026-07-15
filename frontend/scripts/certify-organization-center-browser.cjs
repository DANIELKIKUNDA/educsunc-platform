const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const phase = process.argv[2] ?? 'prepare';
const baseUrl = 'http://127.0.0.1:4174';
const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'organization-center-certification');
const statePath = path.join(artifactDir, 'state.json');

function saveState(state) {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function openBrowser() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
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
  return { browser, page };
}

async function openRegistry(page) {
  await page.goto(`${baseUrl}/app/organisation/ecoles`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('heading', { name: 'Registre des organisations' }).waitFor({ timeout: 60000 });
  await page.locator('.org-table tbody tr').first().waitFor({ timeout: 60000 });
}

async function openFirstOrganizationDetail(page) {
  await openRegistry(page);
  await page.locator('.org-table tbody tr').first().getByTitle('Voir').click();
  await page.locator('.org-detail__hero').waitFor({ timeout: 60000 });
  const match = page.url().match(/organisations\/([^/?]+)/);
  if (!match) throw new Error('Identifiant de l organisation introuvable dans la route detail.');
  return match[1];
}

async function verifyProtectedCreationDraft(page) {
  await openRegistry(page);
  await page.getByRole('button', { name: 'Nouvelle organisation' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Nouvelle organisation' }).waitFor();
  await dialog.getByLabel('Code *').fill(`BROUILLON-${Date.now()}`);
  await dialog.getByRole('button', { name: 'Annuler' }).click();
  await dialog.getByText('Abandonner la saisie ?').waitFor();
  await dialog.getByRole('button', { name: 'Continuer la saisie' }).click();
  await dialog.getByLabel('Code *').waitFor();
  await dialog.getByRole('button', { name: 'Annuler' }).click();
  await dialog.getByRole('button', { name: 'Abandonner' }).click();
  await dialog.waitFor({ state: 'hidden' });
}

async function verifyOrganizationDetailQuality(page) {
  const body = await page.locator('body').innerText();
  for (const forbidden of ['Action sensible non disponible', 'depuis le backend', 'Failed to fetch']) {
    if (body.includes(forbidden)) throw new Error(`Texte interdit encore visible: ${forbidden}.`);
  }
  await page.getByRole('tab', { name: 'Responsable' }).click();
  await page.getByRole('button', { name: 'Modifier les informations du responsable' }).waitFor();
  if (await page.getByRole('button', { name: 'Réinitialiser le mot de passe' }).count()) {
    throw new Error('Une action responsable sans workflow réel reste visible.');
  }
}

async function verifyReversibleOrganizationMutations(page) {
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await page.getByRole('heading', { name: 'Modifier organisation', exact: true }).first().waitFor();
  const nameInput = page.getByLabel("Nom de l organisation *");
  await page.waitForFunction(() => {
    const input = document.querySelector('.org-edit__field input');
    return input instanceof HTMLInputElement && input.value.trim().length > 0;
  }, undefined, { timeout: 30000 });
  const observedName = await nameInput.inputValue();
  const originalName = observedName.replace(/(?: Controle)+$/, '');
  if (observedName !== originalName) {
    await nameInput.fill(originalName);
    const recoveryPromise = page.waitForResponse(
      (response) => response.request().method() === 'PATCH'
        && /^\/api\/organisations\/[^/]+$/.test(new URL(response.url()).pathname),
      { timeout: 30000 },
    );
    await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
    if (!(await recoveryPromise).ok()) throw new Error('Restauration preventive de l organisation refusee.');
  }
  const temporaryName = `${originalName} Controle`;
  await nameInput.fill(temporaryName);
  let responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'PATCH'
      && /^\/api\/organisations\/[^/]+$/.test(new URL(response.url()).pathname),
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  if (!(await responsePromise).ok()) throw new Error('Modification temporaire de l organisation refusee.');
  await nameInput.fill(originalName);
  responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'PATCH'
      && /^\/api\/organisations\/[^/]+$/.test(new URL(response.url()).pathname),
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  if (!(await responsePromise).ok()) throw new Error('Restauration de l organisation refusee.');
  await page.getByRole('button', { name: 'Voir organisation' }).click();
  await page.locator('.org-detail__hero').waitFor({ timeout: 60000 });

  const statusButton = page.locator('.org-detail__actions').getByRole('button', { name: /Activer|Desactiver/ });
  const initialAction = (await statusButton.innerText()).trim();
  await statusButton.click();
  let dialog = page.getByRole('dialog');
  responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST'
      && /^\/api\/organisations\/[^/]+\/(activer|desactiver)$/.test(new URL(response.url()).pathname),
    { timeout: 30000 },
  );
  await dialog.getByRole('button', { name: initialAction, exact: true }).click();
  if (!(await responsePromise).ok()) throw new Error('Changement temporaire du statut organisation refuse.');
  const restoreAction = initialAction === 'Desactiver' ? 'Activer' : 'Desactiver';
  await page.locator('.org-detail__actions').getByRole('button', { name: restoreAction, exact: true }).click();
  dialog = page.getByRole('dialog');
  responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST'
      && /^\/api\/organisations\/[^/]+\/(activer|desactiver)$/.test(new URL(response.url()).pathname),
    { timeout: 30000 },
  );
  await dialog.getByRole('button', { name: restoreAction, exact: true }).click();
  if (!(await responsePromise).ok()) throw new Error('Restauration du statut organisation refusee.');
}

async function verifyCanonicalNavigation(page, organizationId) {
  await page.getByRole('tab', { name: 'Ecoles rattachees' }).click();
  await page.waitForURL(`**/organisation/organisations/${organizationId}/ecoles`, { timeout: 30000 });
  await page.getByRole('heading', { name: 'Ecoles rattachees' }).waitFor({ timeout: 60000 });
  if (await page.getByText('Ecoles indisponibles', { exact: true }).count()) {
    throw new Error('La page dediee refuse encore le Manager systeme.');
  }

  await openRegistry(page);
  await page.locator('.org-table tbody tr').first().getByTitle('Ouvrir les ecoles').click();
  await page.waitForURL(`**/organisation/organisations/${organizationId}/ecoles`, { timeout: 30000 });
  await page.getByRole('heading', { name: 'Ecoles rattachees' }).waitFor({ timeout: 60000 });
}

async function createSchool(page, organizationId) {
  if (fs.existsSync(statePath)) {
    const previousState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (previousState.organizationId === organizationId && previousState.school?.name) {
      const existingSchool = page.getByText(previousState.school.name, { exact: true }).first();
      if (await existingSchool.isVisible().catch(() => false)) return previousState.school;
    }
  }

  const suffix = Date.now().toString().slice(-8);
  const school = {
    code: `CERT-${suffix}`,
    name: `Ecole Certification ${suffix}`,
  };
  await page.getByRole('button', { name: 'Creer une ecole' }).first().click();
  await page.waitForURL(/administration-ecole\/ecoles.*creation=1/, { timeout: 30000 });
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Nouvelle ecole' }).waitFor({ timeout: 30000 });
  const organizationSelect = dialog.getByLabel('Organisation *');
  if (!(await organizationSelect.isDisabled())) {
    throw new Error('L organisation parente n est pas verrouillee dans le formulaire contextualise.');
  }
  if ((await organizationSelect.inputValue()) !== organizationId) {
    throw new Error('Le formulaire ne porte pas l organisation consultee.');
  }
  await dialog.getByLabel('Code *').fill(school.code);
  await dialog.getByLabel('Nom officiel *').fill(school.name);
  const responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().endsWith('/api/ecoles'),
    { timeout: 30000 },
  );
  await dialog.getByRole('button', { name: "Creer l'ecole" }).click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`Creation ecole refusee: ${response.status()}.`);
  await page.waitForURL(`**/organisation/organisations/${organizationId}/ecoles`, { timeout: 30000 });
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 30000 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  return school;
}

async function openModules(page, organizationId) {
  const effectiveResponsePromise = page.waitForResponse(
    (response) => response.request().method() === 'GET'
      && response.url().includes('/api/v1/configuration/effective')
      && response.url().includes('niveau=ORGANIZATION'),
    { timeout: 30000 },
  );
  await page.goto(`${baseUrl}/app/organisation/organisations/${organizationId}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const effectiveResponse = await effectiveResponsePromise;
  if (!effectiveResponse.ok()) throw new Error(`Lecture des modules refusee: ${effectiveResponse.status()}.`);
  await page.locator('.org-detail__hero').waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Configurer les modules' }).click();
  const cards = page.locator('.org-modules__card:not(.is-disabled)');
  await cards.first().waitFor({ timeout: 60000 });
  return cards;
}

async function saveModules(page) {
  const responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'PUT' && response.url().includes('/configuration/modules/organisations/'),
    { timeout: 30000 },
  );
  await page.getByRole('button', { name: 'Enregistrer les changements' }).click();
  const confirmDialog = page.getByRole('dialog');
  await confirmDialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`Modules organisation refuses: ${response.status()}.`);
  await confirmDialog.waitFor({ state: 'detached', timeout: 30000 });
}

async function prepare(page) {
  await verifyProtectedCreationDraft(page);
  const organizationId = await openFirstOrganizationDetail(page);
  await verifyOrganizationDetailQuality(page);
  await verifyReversibleOrganizationMutations(page);
  await verifyCanonicalNavigation(page, organizationId);
  const school = await createSchool(page, organizationId);
  const cards = await openModules(page, organizationId);
  const firstCard = cards.first();
  const checkbox = firstCard.locator('input[type="checkbox"]');
  const originalChecked = await checkbox.isChecked();
  await checkbox.setChecked(!originalChecked, { force: true });
  await saveModules(page);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  const cardsAfterRefresh = await openModules(page, organizationId);
  const changedAfterRefresh = await cardsAfterRefresh.first().locator('input[type="checkbox"]').isChecked();
  if (changedAfterRefresh !== !originalChecked) {
    throw new Error(`La selection des modules ne persiste pas apres actualisation (avant=${originalChecked}, relu=${changedAfterRefresh}).`);
  }

  await page.screenshot({ path: path.join(artifactDir, 'desktop-prepare.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('.org-modules__card').first().waitFor({ timeout: 60000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) throw new Error('Le Centre Organisation deborde horizontalement sur mobile.');
  await page.screenshot({ path: path.join(artifactDir, 'mobile-prepare.png'), fullPage: true });

  saveState({ organizationId, school, originalChecked, preparedAt: new Date().toISOString() });
}

async function verifyAndRestore(page) {
  if (!fs.existsSync(statePath)) throw new Error('Etat de certification Organisation introuvable.');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  await page.goto(`${baseUrl}/app/organisation/organisations/${state.organizationId}/ecoles`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(state.school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  const cards = await openModules(page, state.organizationId);
  const card = cards.first();
  const checkbox = card.locator('input[type="checkbox"]');
  if ((await checkbox.isChecked()) !== !state.originalChecked) {
    throw new Error('La selection des modules ne persiste pas apres redemarrage.');
  }
  await checkbox.setChecked(state.originalChecked, { force: true });
  await saveModules(page);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  const restoredCards = await openModules(page, state.organizationId);
  const restored = await restoredCards.first().locator('input[type="checkbox"]').isChecked();
  if (restored !== state.originalChecked) throw new Error('La selection initiale des modules n a pas ete restauree.');
  saveState({ ...state, restored: true, certifiedAt: new Date().toISOString() });
}

async function finalCheck(page) {
  if (!fs.existsSync(statePath)) throw new Error('Etat de certification Organisation introuvable.');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  await page.goto(`${baseUrl}/app/organisation/organisations/${state.organizationId}/ecoles`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(state.school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  const cards = await openModules(page, state.organizationId);
  const restored = await cards.first().locator('input[type="checkbox"]').isChecked();
  if (restored !== state.originalChecked) throw new Error('La selection initiale des modules ne persiste pas apres la verification finale.');
  saveState({ ...state, finalCheck: true, finalCheckAt: new Date().toISOString() });
}

async function run() {
  if (!['prepare', 'verify-restore', 'final-check'].includes(phase)) throw new Error(`Phase inconnue: ${phase}`);
  fs.mkdirSync(artifactDir, { recursive: true });
  const { browser, page } = await openBrowser();
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 500) runtimeErrors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      runtimeErrors.push(message.text());
    }
  });
  try {
    if (phase === 'prepare') await prepare(page);
    else if (phase === 'verify-restore') await verifyAndRestore(page);
    else await finalCheck(page);
  } finally {
    await browser.close();
  }
  if (runtimeErrors.length > 0) throw new Error(`Erreurs navigateur: ${runtimeErrors.join(' | ')}`);
  process.stdout.write(`Organization Center browser certification ${phase}: OK\n`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
