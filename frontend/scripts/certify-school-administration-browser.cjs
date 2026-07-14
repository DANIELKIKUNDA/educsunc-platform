const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const phase = process.argv[2] ?? 'prepare';
const baseUrl = 'http://127.0.0.1:4174';
const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'school-administration-certification');
const statePath = path.join(artifactDir, 'state.json');

async function createBrowser() {
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
  await page.goto(`${baseUrl}/app/administration-ecole/ecoles`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('heading', { name: 'Registre des ecoles' }).waitFor({ timeout: 60000 });
  const organizationSelect = page.locator('.school-admin-toolbar__field select').first();
  await page.waitForFunction(
    () => document.querySelectorAll('.school-admin-toolbar__field select option').length > 1,
    undefined,
    { timeout: 60000 },
  );
  return organizationSelect;
}

async function verifyDashboard(page) {
  const schoolsResponsePromise = page.waitForResponse(
    (response) => response.request().method() === 'GET'
      && /\/api\/organisations\/[^/]+\/ecoles\?/.test(response.url()),
    { timeout: 60000 },
  );
  await page.goto(`${baseUrl}/app/administration-ecole`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByRole('heading', { name: 'Administration des ecoles' }).waitFor({ timeout: 60000 });
  await page.getByRole('heading', { name: 'Organisation selectionnee' }).waitFor({ timeout: 60000 });
  const schoolsResponse = await schoolsResponsePromise;
  if (!schoolsResponse.ok()) throw new Error(`Lecture du tableau de bord refusee: ${schoolsResponse.status()}.`);
  const schoolsPayload = await schoolsResponse.json();
  const schools = Array.isArray(schoolsPayload?.donnees) ? schoolsPayload.donnees : [];
  const expectedCards = new Map([
    ['Ecoles enregistrees', schools.length],
    ['Ecoles actives', schools.filter((school) => school.actif).length],
    ['Ecoles inactives', schools.filter((school) => !school.actif).length],
    ['Mode synchronise', schools.filter((school) => school.modeExploitation === 'SYNC').length],
  ]);
  for (const [label, expected] of expectedCards) {
    const actual = await page.locator('.stat-card').filter({ hasText: label }).locator('strong').innerText();
    if (Number(actual.trim()) !== expected) {
      throw new Error(`Compteur ${label} incoherent: attendu ${expected}, affiche ${actual}.`);
    }
  }
  const body = await page.locator('body').innerText();
  const desktopOverflow = await page.evaluate(() => {
    const content = document.querySelector('.erp-shell__content');
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      || (content instanceof HTMLElement && content.scrollWidth > content.clientWidth + 1);
  });
  if (desktopOverflow) throw new Error('La fiche ecole deborde horizontalement sur desktop.');
  if (body.includes('Organisation selectionnee\nA choisir')) {
    throw new Error("L'organisation active reste une valeur de repli.");
  }
  if (body.includes('La lecture PostgreSQL')) {
    throw new Error('Un message technique PostgreSQL reste visible.');
  }
  await page.screenshot({ path: path.join(artifactDir, 'dashboard-desktop.png'), fullPage: true });
}

async function selectAndVerifyOrganizations(page) {
  const select = await openRegistry(page);
  const options = await select.locator('option').evaluateAll((items) => items
    .map((item) => ({ value: item.value, label: item.textContent?.trim() ?? '' }))
    .filter((item) => item.value));
  if (options.length === 0) throw new Error('Aucune organisation reelle disponible.');
  if (options.some((option) => option.value === 'org-archedu')) {
    throw new Error("L'organisation de demonstration est encore proposee.");
  }

  const selected = await select.inputValue();
  const first = options.find((option) => option.value === selected) ?? options[0];
  if (selected !== first.value) await select.selectOption(first.value);
  await page.locator('.school-admin-registry__table tbody tr, .school-admin-registry__mobile-card').first().waitFor({ timeout: 60000 });

  if (options.length > 1) {
    const second = options.find((option) => option.value !== first.value);
    const responsePromise = page.waitForResponse(
      (response) => response.request().method() === 'GET'
        && response.url().includes(`/api/organisations/${second.value}/ecoles`),
      { timeout: 30000 },
    );
    await select.selectOption(second.value);
    const response = await responsePromise;
    if (!response.ok()) throw new Error(`Changement d'organisation refuse: ${response.status()}.`);
    await select.selectOption(first.value);

    const shellSelect = page.locator('.context-strip__field--wide select').first();
    const shellResponsePromise = page.waitForResponse(
      (response) => response.request().method() === 'PUT'
        && response.url().endsWith('/api/auth/contexte/organisation-active'),
      { timeout: 30000 },
    );
    await shellSelect.selectOption(second.value);
    const shellResponse = await shellResponsePromise;
    if (!shellResponse.ok()) throw new Error(`Changement depuis le Shell refuse: ${shellResponse.status()}.`);
    await page.waitForFunction(
      (organizationId) => {
        const selectElement = document.querySelector('.school-admin-toolbar__field select');
        return selectElement instanceof HTMLSelectElement && selectElement.value === organizationId;
      },
      second.value,
      { timeout: 30000 },
    );
    const restorePromise = page.waitForResponse(
      (response) => response.request().method() === 'PUT'
        && response.url().endsWith('/api/auth/contexte/organisation-active'),
      { timeout: 30000 },
    );
    await shellSelect.selectOption(first.value);
    const restoreResponse = await restorePromise;
    if (!restoreResponse.ok()) throw new Error(`Restauration du contexte Shell refusee: ${restoreResponse.status()}.`);
  }

  return first;
}

async function createSchool(page, organization) {
  if (fs.existsSync(statePath)) {
    const previous = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (previous.school?.id && previous.school?.name) return previous.school;
  }

  const suffix = Date.now().toString().slice(-8);
  const school = { code: `ADM-${suffix}`, name: `Ecole Certification ADM ${suffix}` };
  await page.getByRole('button', { name: 'Nouvelle ecole' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Nouvelle ecole' }).waitFor({ timeout: 30000 });
  const organizationSelect = dialog.getByLabel('Organisation *');
  if ((await organizationSelect.inputValue()) !== organization.value) {
    await organizationSelect.selectOption(organization.value);
  }
  await dialog.getByLabel('Code *').fill(school.code);
  await dialog.getByLabel('Nom officiel *').fill(school.name);
  await dialog.getByLabel('Sigle').fill('CERT');
  await dialog.getByLabel('Ville').fill('Lubumbashi');
  const responsePromise = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().endsWith('/api/ecoles'),
    { timeout: 30000 },
  );
  await dialog.getByRole('button', { name: "Creer l'ecole" }).click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`Creation refusee: ${response.status()} ${await response.text()}`);
  const payload = await response.json();
  school.id = payload?.donnee?.id ?? payload?.data?.id ?? payload?.id;
  if (!school.id) throw new Error("La creation n'a pas retourne l'identifiant de l'ecole.");
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 30000 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  return school;
}

async function verifyCanonicalDetail(page, school) {
  await page.goto(`${baseUrl}/app/organisation/ecoles/${school.id}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForURL(`**/administration-ecole/ecoles/${school.id}`, { timeout: 30000 });
  const currentHeading = page.locator('.school-detail__hero h1');
  await currentHeading.waitFor({ timeout: 60000 });
  if ((await currentHeading.innerText()).trim() !== school.name) {
    await openMoreAction(page, 'Renommer l’école');
    const recoveryDialog = page.getByRole('dialog');
    await recoveryDialog.getByLabel('Nouveau nom officiel').fill(school.name);
    const recoveryResponse = page.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/renommer'));
    await recoveryDialog.getByRole('button', { name: 'Enregistrer le nouveau nom' }).click();
    if (!(await recoveryResponse).ok()) throw new Error('Restauration preventive du nom refusee.');
  }
  await page.getByRole('heading', { name: school.name, exact: true }).waitFor({ timeout: 60000 });
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  await page.getByRole('heading', { name: "Modules de l’école" }).waitFor({ timeout: 60000 });
  const body = await page.locator('body').innerText();
  if (/PostgreSQL|depuis le backend|validation du backend|referentiel academique a echoue/i.test(body)) {
    throw new Error('La fiche canonique expose encore du vocabulaire technique.');
  }
  const timeline = await page.locator('.school-detail__timeline').innerText();
  if (/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(timeline)) {
    throw new Error('La tracabilite affiche encore un identifiant technique.');
  }
  if (timeline.includes('Auteur non disponible')) {
    throw new Error(`La tracabilite n'a pas resolu le nom humain de l'auteur: ${timeline.replace(/\s+/g, ' ')}`);
  }
  await page.getByRole('button', { name: 'Modifier', exact: true }).first().click();
  const identityDialog = page.getByRole('dialog');
  await identityDialog.getByRole('heading', { name: "Modifier l’identité de l’école" }).waitFor();
  await identityDialog.getByRole('button', { name: 'Annuler' }).click();
  await identityDialog.waitFor({ state: 'hidden' });
  const modulesButton = page.getByRole('button', { name: 'Gérer les modules' }).first();
  if (await modulesButton.isVisible()) {
    await modulesButton.click();
    const modulesDialog = page.getByRole('dialog');
    await modulesDialog.getByRole('heading', { name: "Gérer les modules de l’école" }).waitFor();
    await modulesDialog.getByRole('button', { name: 'Annuler' }).click();
    await modulesDialog.waitFor({ state: 'hidden' });
  }
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0 });
    const content = document.querySelector('.erp-shell__content');
    if (content instanceof HTMLElement) content.scrollTo({ top: 0, left: 0 });
  });
  await page.screenshot({ path: path.join(artifactDir, 'detail-desktop.png'), fullPage: false });
}

async function openMoreAction(page, actionName) {
  const details = page.locator('.school-detail__more');
  if (!(await details.evaluate((element) => element.hasAttribute('open')))) await details.locator('summary').click();
  await details.getByRole('button', { name: actionName }).click();
}

async function verifyReversibleMutations(page, school) {
  const originalName = school.name;
  const temporaryName = `${originalName} Controle`;

  await page.getByRole('button', { name: 'Modifier', exact: true }).first().click();
  let dialog = page.getByRole('dialog');
  const phoneInput = dialog.locator('input[type="tel"]');
  const originalPhone = await phoneInput.inputValue();
  const testPhone = originalPhone === '+243 999 000 111' ? '+243 999 000 112' : '+243 999 000 111';
  await phoneInput.fill(testPhone);
  let responsePromise = page.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/informations-institutionnelles'));
  await dialog.getByRole('button', { name: 'Enregistrer les informations' }).click();
  if (!(await responsePromise).ok()) throw new Error('Modification des coordonnees refusee.');
  await page.getByText(testPhone, { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Modifier', exact: true }).first().click();
  dialog = page.getByRole('dialog');
  await dialog.locator('input[type="tel"]').fill(originalPhone);
  responsePromise = page.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/informations-institutionnelles'));
  await dialog.getByRole('button', { name: 'Enregistrer les informations' }).click();
  if (!(await responsePromise).ok()) throw new Error('Restauration des coordonnees refusee.');

  await openMoreAction(page, 'Renommer l’école');
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nouveau nom officiel').fill(temporaryName);
  responsePromise = page.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/renommer'));
  await dialog.getByRole('button', { name: 'Enregistrer le nouveau nom' }).click();
  if (!(await responsePromise).ok()) throw new Error('Renommage temporaire refuse.');
  await page.getByRole('heading', { name: temporaryName, exact: true }).waitFor();
  await openMoreAction(page, 'Renommer l’école');
  dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nouveau nom officiel').fill(originalName);
  responsePromise = page.waitForResponse((response) => response.request().method() === 'PATCH' && response.url().includes('/renommer'));
  await dialog.getByRole('button', { name: 'Enregistrer le nouveau nom' }).click();
  if (!(await responsePromise).ok()) throw new Error('Restauration du nom refusee.');
  await page.getByRole('heading', { name: originalName, exact: true }).waitFor();

  await openMoreAction(page, 'Changer le mode');
  dialog = page.getByRole('dialog');
  const checkedMode = await dialog.locator('input[type="radio"]:checked').inputValue();
  const targetMode = checkedMode === 'SYNC' ? 'OFFLINE_ONLY' : 'SYNC';
  await dialog.locator(`input[type="radio"][value="${targetMode}"]`).check();
  responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes('/changer-mode'));
  await dialog.getByRole('button', { name: 'Enregistrer le mode' }).click();
  if (!(await responsePromise).ok()) throw new Error('Changement temporaire du mode refuse.');
  await openMoreAction(page, 'Changer le mode');
  dialog = page.getByRole('dialog');
  await dialog.locator(`input[type="radio"][value="${checkedMode}"]`).check();
  responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes('/changer-mode'));
  await dialog.getByRole('button', { name: 'Enregistrer le mode' }).click();
  if (!(await responsePromise).ok()) throw new Error('Restauration du mode refusee.');

  const modulesButton = page.getByRole('button', { name: 'Gérer les modules' }).first();
  if (await modulesButton.isVisible()) {
    await modulesButton.click();
    dialog = page.getByRole('dialog');
    const firstModule = dialog.locator('input[type="checkbox"]').first();
    if (await firstModule.count()) {
      await firstModule.click();
      responsePromise = page.waitForResponse((response) => response.request().method() === 'PUT' && response.url().includes('/configuration/modules/ecoles/'));
      await dialog.getByRole('button', { name: 'Enregistrer les changements' }).click();
      if (!(await responsePromise).ok()) throw new Error('Modification temporaire des modules refusee.');
      await modulesButton.click();
      dialog = page.getByRole('dialog');
      await dialog.locator('input[type="checkbox"]').first().click();
      responsePromise = page.waitForResponse((response) => response.request().method() === 'PUT' && response.url().includes('/configuration/modules/ecoles/'));
      await dialog.getByRole('button', { name: 'Enregistrer les changements' }).click();
      if (!(await responsePromise).ok()) throw new Error('Restauration des modules refusee.');
    } else {
      await dialog.getByRole('button', { name: 'Annuler' }).click();
    }
  }

  await openMoreAction(page, 'Désactiver l’école');
  dialog = page.getByRole('dialog');
  responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/desactiver'));
  await dialog.getByRole('button', { name: 'Désactiver l’école' }).click();
  if (!(await responsePromise).ok()) throw new Error('Desactivation temporaire refusee.');
  await openMoreAction(page, 'Activer l’école');
  dialog = page.getByRole('dialog');
  responsePromise = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().endsWith('/activer'));
  await dialog.getByRole('button', { name: 'Activer l’école' }).click();
  if (!(await responsePromise).ok()) throw new Error('Reactivation de restauration refusee.');
}

async function verifyMobile(page, school) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/app/administration-ecole/ecoles/${school.id}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) throw new Error('La fiche ecole deborde horizontalement sur mobile.');
  await page.screenshot({ path: path.join(artifactDir, 'detail-mobile.png'), fullPage: true });
}

async function prepare(page) {
  await verifyDashboard(page);
  const organization = await selectAndVerifyOrganizations(page);
  const school = await createSchool(page, organization);
  const search = page.getByPlaceholder('Nom, code, sigle, ville ou commune...');
  await search.fill(school.code);
  await page.getByText(school.code, { exact: true }).first().waitFor({ timeout: 30000 });
  await verifyCanonicalDetail(page, school);
  await verifyReversibleMutations(page, school);
  await verifyMobile(page, school);
  fs.writeFileSync(statePath, `${JSON.stringify({ organization, school, preparedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
}

async function verifyPersistence(page) {
  if (!fs.existsSync(statePath)) throw new Error('Etat de certification introuvable.');
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  await page.goto(`${baseUrl}/app/administration-ecole/ecoles/${state.school.id}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.getByText(state.school.name, { exact: true }).first().waitFor({ timeout: 60000 });
  await page.getByRole('heading', { name: "Modules de l’école" }).waitFor({ timeout: 60000 });
  fs.writeFileSync(statePath, `${JSON.stringify({ ...state, persistedAfterRestart: true, certifiedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
}

async function run() {
  if (!['prepare', 'verify-persistence'].includes(phase)) throw new Error(`Phase inconnue: ${phase}`);
  fs.mkdirSync(artifactDir, { recursive: true });
  const { browser, page } = await createBrowser();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 500) errors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  try {
    if (phase === 'prepare') await prepare(page);
    else await verifyPersistence(page);
  } finally {
    await browser.close();
  }
  if (errors.length > 0) throw new Error(`Erreurs navigateur: ${errors.join(' | ')}`);
  process.stdout.write(`School Administration browser certification ${phase}: OK\n`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
