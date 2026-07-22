const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = process.env.SECURITY_CERT_BASE_URL || 'http://127.0.0.1:4174';
const DEV_TIMEOUT_MS = Number(process.env.SECURITY_CERT_DEV_TIMEOUT_MS || 120000);
const ARTIFACT_DIR = path.resolve(
  process.env.SECURITY_CERT_ARTIFACT_DIR || path.join(__dirname, '..', 'artifacts', 'security-browser-certification'),
);
const REPORT_PATH = path.join(ARTIFACT_DIR, 'report.json');
const VIEWPORT_HEIGHT = 1000;
const VIEWPORTS = [1440, 1280, 1024, 768, 430, 390, 360];
const TABS = [
  { code: 'overview', label: 'Vue d\u2019ensemble', heading: 'Vue d\u2019ensemble' },
  { code: 'accounts', label: 'Comptes', heading: 'Comptes Plateforme' },
  { code: 'administrators', label: 'Administrateurs', heading: 'Administrateurs des p\u00e9rim\u00e8tres' },
  { code: 'roles', label: 'R\u00f4les', heading: 'R\u00f4les et permissions' },
  { code: 'assignments', label: 'Affectations', heading: 'Affectations et p\u00e9rim\u00e8tres' },
  { code: 'sessions', label: 'Sessions', heading: 'Sessions' },
  { code: 'attempts', label: 'Tentatives', heading: 'Tentatives et verrouillages' },
  { code: 'audit', label: 'Historique', heading: 'Historique de s\u00e9curit\u00e9' },
];

class NotExecutedError extends Error {
  constructor(message, evidence = null) {
    super(message);
    this.name = 'NotExecutedError';
    this.evidence = evidence;
  }
}

const report = {
  schemaVersion: 1,
  certification: 'security-center-browser',
  startedAt: new Date().toISOString(),
  finishedAt: null,
  baseUrl: BASE_URL,
  actor: 'MANAGER_SYSTEME',
  configuration: { devTimeoutMs: DEV_TIMEOUT_MS, viewportHeight: VIEWPORT_HEIGHT, widths: VIEWPORTS, tabs: TABS },
  devInitialization: { status: 'not_executed', attempts: [] },
  scenarios: [],
  matrix: [],
  telemetry: { console: [], requests: [], failedRequests: [] },
  fatalError: null,
  summary: null,
};

function serializeError(error) {
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: error?.stack || null,
  };
}

function writeReport() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function sleep(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

async function waitForDev() {
  const deadline = Date.now() + DEV_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const startedAt = new Date().toISOString();
    try {
      const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
      report.devInitialization.attempts.push({ startedAt, status: response.status });
      if (response.status < 500) {
        report.devInitialization.status = 'passed';
        report.devInitialization.readyAt = new Date().toISOString();
        return;
      }
    } catch (error) {
      report.devInitialization.attempts.push({ startedAt, error: error.message });
    }
    await sleep(1000);
  }
  report.devInitialization.status = 'failed';
  throw new Error(`Le serveur dev n'est pas pret apres ${DEV_TIMEOUT_MS} ms: ${BASE_URL}`);
}

function attachTelemetry(page) {
  page.on('console', (message) => {
    report.telemetry.console.push({
      at: new Date().toISOString(),
      type: message.type(),
      text: message.text(),
      location: message.location(),
    });
  });
  page.on('request', (request) => {
    report.telemetry.requests.push({
      at: new Date().toISOString(),
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      status: null,
    });
  });
  page.on('response', (response) => {
    const request = response.request();
    const entry = [...report.telemetry.requests].reverse().find((item) => (
      item.status === null && item.url === response.url() && item.method === request.method()
    ));
    if (entry) {
      entry.status = response.status();
      entry.ok = response.ok();
    }
  });
  page.on('requestfailed', (request) => {
    report.telemetry.failedRequests.push({
      at: new Date().toISOString(),
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      error: request.failure()?.errorText || 'Echec inconnu',
    });
  });
}

async function measureOverflow(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const tolerance = 2;
    const offenders = [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.right > root.clientWidth + tolerance || rect.left < -tolerance);
      })
      .slice(0, 20)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        classes: typeof element.className === 'string' ? element.className : null,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
      }));
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      overflow: root.scrollWidth > root.clientWidth + tolerance,
      offenders,
    };
  });
}

async function openTab(page, code) {
  const index = TABS.findIndex((tab) => tab.code === code);
  if (index < 0) throw new Error(`Onglet inconnu: ${code}`);
  const tab = page.getByRole('tab').nth(index);
  await tab.click();
  await page.getByRole('heading', { name: TABS[index].heading, exact: true }).waitFor();
  return tab;
}

async function cancelDialog(page) {
  const dialog = page.getByRole('dialog');
  if (await dialog.count()) {
    await dialog.getByRole('button', { name: 'Annuler', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
  }
}

async function requireVisible(locator, reason) {
  if (!(await locator.first().isVisible().catch(() => false))) throw new NotExecutedError(reason);
  return locator.first();
}

async function initializeManagerThroughDevUi(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const menu = page.locator('.erp-user-menu__summary');
  await menu.waitFor({ timeout: 60000 });
  await menu.click();
  const actorSelect = page.locator('.erp-user-menu__switch select');
  await actorSelect.waitFor({ timeout: 30000 });
  const availableActors = await actorSelect.locator('option').evaluateAll((options) => (
    options.map((option) => ({ value: option.value, label: option.textContent?.trim() || '' }))
  ));
  if (!availableActors.some((actor) => actor.value === 'MANAGER_SYSTEME')) {
    throw new Error('Le selecteur dev ne propose pas MANAGER_SYSTEME.');
  }
  await actorSelect.selectOption('MANAGER_SYSTEME');
  await page.waitForFunction(() => {
    const select = document.querySelector('.erp-user-menu__switch select');
    return select instanceof HTMLSelectElement && select.value === 'MANAGER_SYSTEME';
  });
  report.devInitialization.managerSession = { selectedActor: 'MANAGER_SYSTEME', availableActors };
}

async function observeTab(page, code) {
  await openTab(page, code);
  const definition = TABS.find((tab) => tab.code === code);
  return { tab: code, heading: definition.heading, visible: true };
}

async function mutationNotExecuted(page, code, reason, observe) {
  const evidence = await observeTab(page, code);
  if (observe) {
    try {
      Object.assign(evidence, await observe());
    } catch (error) {
      evidence.uiSubproofUnavailable = error.message;
    } finally {
      await cancelDialog(page).catch(() => undefined);
    }
  }
  evidence.mutationSubmitted = false;
  throw new NotExecutedError(reason, evidence);
}

async function runMatrix(page) {
  const screenshotsDir = path.join(ARTIFACT_DIR, 'matrix');
  fs.mkdirSync(screenshotsDir, { recursive: true });
  for (const width of VIEWPORTS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    for (const tabDefinition of TABS) {
      const startedAt = new Date().toISOString();
      const entry = {
        width,
        tab: tabDefinition.code,
        label: tabDefinition.label,
        status: 'not_executed',
        startedAt,
        finishedAt: null,
        evidence: {},
      };
      try {
        const tab = await openTab(page, tabDefinition.code);
        const screenshot = path.join(screenshotsDir, `${width}-${tabDefinition.code}.png`);
        const overflow = await measureOverflow(page);
        await page.screenshot({ path: screenshot, fullPage: true });
        const selected = await tab.getAttribute('aria-selected');
        if (selected !== 'true') throw new Error(`L'onglet ${tabDefinition.label} n'est pas annonce comme actif.`);
        if (overflow.overflow) throw new Error(`Overflow horizontal detecte (${overflow.scrollWidth}/${overflow.clientWidth}).`);
        entry.status = 'passed';
        entry.evidence = { selected, heading: tabDefinition.heading, overflow, screenshot: path.relative(ARTIFACT_DIR, screenshot) };
      } catch (error) {
        entry.status = 'failed';
        entry.error = serializeError(error);
        entry.evidence.overflow = await measureOverflow(page).catch(() => null);
      }
      entry.finishedAt = new Date().toISOString();
      report.matrix.push(entry);
    }
  }
  await page.setViewportSize({ width: 1440, height: VIEWPORT_HEIGHT });
}

const UI_SUBPROOFS = [
  ['SEC-001', 'Initialisation du serveur dev', async () => ({ readyAt: report.devInitialization.readyAt })],
  ['SEC-002', 'Ouverture de la route du Centre Securite', async (page) => {
    await page.getByRole('heading', { name: 'Centre S\u00e9curit\u00e9', exact: true }).waitFor();
    return { url: page.url() };
  }],
  ['SEC-003', 'Session Manager systeme active', async (page) => {
    const body = await page.locator('body').innerText();
    if (!body.includes('Manager syst\u00e8me')) throw new Error("Le libelle de l'acteur Manager systeme est absent.");
    return { actor: 'MANAGER_SYSTEME' };
  }],
  ['SEC-004', 'Absence de panneau indisponible', async (page) => {
    const count = await page.getByText('Centre temporairement indisponible', { exact: true }).count();
    if (count) throw new Error('Le Centre affiche son etat indisponible.');
    return { unavailablePanels: count };
  }],
  ['SEC-005', 'Presence des huit onglets', async (page) => {
    const tabs = page.getByRole('tab');
    const labels = (await tabs.allTextContents()).map((value) => value.trim());
    if (labels.length !== TABS.length) throw new Error(`${labels.length} onglet(s) trouves au lieu de ${TABS.length}.`);
    return { labels };
  }],
  ['SEC-006', "Indicateurs de la vue d'ensemble", async (page) => {
    await openTab(page, 'overview');
    const cards = page.locator('.security-stats > *');
    const count = await cards.count();
    if (count !== 6) throw new Error(`${count} indicateur(s) trouves au lieu de 6.`);
    return { cardCount: count };
  }],
  ['SEC-007', 'Actualisation manuelle', async (page) => {
    await page.getByRole('button', { name: 'Actualiser', exact: true }).click();
    await page.locator('.security-stats').waitFor();
    return { refreshed: true };
  }],
  ['SEC-008', 'Affichage des comptes ou de leur etat vide', async (page) => {
    await openTab(page, 'accounts');
    const table = page.locator('.security-table-wrap');
    const empty = page.locator('.ui-state--empty');
    if (!(await table.count()) && !(await empty.count())) throw new Error('Ni comptes ni etat vide ne sont affiches.');
    return { rowCount: await page.locator('.security-table tbody tr').count(), empty: Boolean(await empty.count()) };
  }],
  ['SEC-009', 'Recherche de comptes', async (page) => {
    await openTab(page, 'accounts');
    const input = page.getByPlaceholder('Nom, adresse e-mail ou r\u00f4le');
    await input.fill('__certification_absent__');
    const empty = await page.locator('.ui-state--empty').isVisible();
    await input.fill('');
    if (!empty) throw new Error("La recherche impossible n'affiche pas l'etat vide.");
    return { query: '__certification_absent__', empty };
  }],
  ['SEC-010', 'Filtre d etat des comptes', async (page) => {
    await openTab(page, 'accounts');
    const select = page.locator('.security-toolbar select');
    await select.selectOption('ACTIVE');
    const value = await select.inputValue();
    await select.selectOption('ALL');
    return { selectedValue: value };
  }],
  ['SEC-011', 'Ouverture du formulaire nouveau compte', async (page) => {
    await openTab(page, 'accounts');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouveau compte' }), "Permission de creation de compte absente.");
    await button.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Cr\u00e9er un compte Plateforme' }).waitFor();
    const fields = await dialog.locator('input, select, textarea').count();
    await cancelDialog(page);
    return { fields };
  }],
  ['SEC-012', 'Validation locale du nouveau compte', async (page) => {
    await openTab(page, 'accounts');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouveau compte' }), "Permission de creation de compte absente.");
    await button.click();
    const confirm = page.getByRole('dialog').getByRole('button', { name: 'Confirmer' });
    const disabled = await confirm.isDisabled();
    await cancelDialog(page);
    if (!disabled) throw new Error('La confirmation vide est active.');
    return { emptyFormConfirmationDisabled: disabled };
  }],
  ['SEC-013', 'Confirmation non destructive du cycle de vie compte', async (page) => {
    await openTab(page, 'accounts');
    const action = await requireVisible(page.locator('.security-row-actions button'), 'Aucun compte actionnable dans les donnees courantes.');
    const label = (await action.innerText()).trim();
    await action.click();
    await page.getByRole('dialog').waitFor();
    await cancelDialog(page);
    return { action: label, submitted: false };
  }],
  ['SEC-014', 'Affichage des deux gouvernances administrateur', async (page) => {
    await openTab(page, 'administrators');
    const panels = page.locator('.security-split > article');
    const count = await panels.count();
    if (count !== 2) throw new Error(`${count} gouvernance(s) affichee(s) au lieu de 2.`);
    return { panelCount: count };
  }],
  ['SEC-015', 'Formulaire administrateur Organisation', async (page) => {
    await openTab(page, 'administrators');
    const button = await requireVisible(page.getByRole('button', { name: 'Ajouter', exact: true }), "Permission d'ajout administrateur Organisation absente.");
    await button.click();
    await page.getByRole('dialog').waitFor();
    const organizationSelects = await page.getByRole('dialog').locator('select').count();
    await cancelDialog(page);
    return { selectCount: organizationSelects, submitted: false };
  }],
  ['SEC-016', 'Intervention administrateur Ecole', async (page) => {
    await openTab(page, 'administrators');
    const button = await requireVisible(page.getByRole('button', { name: 'Intervention exceptionnelle' }), "Permission d'intervention Ecole absente.");
    await button.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText('Intervention Plateforme exceptionnelle', { exact: true }).waitFor();
    await cancelDialog(page);
    return { warningVisible: true, submitted: false };
  }],
  ['SEC-017', 'Annuaire des roles', async (page) => {
    await openTab(page, 'roles');
    const count = await page.locator('.security-role-list-item').count();
    if (!count) throw new NotExecutedError('Aucun role fourni par le backend.');
    return { roleCount: count };
  }],
  ['SEC-018', 'Recherche dans les roles', async (page) => {
    await openTab(page, 'roles');
    const input = page.getByPlaceholder('Rechercher une responsabilit\u00e9');
    await input.fill('__certification_absent__');
    const empty = await page.locator('.security-role-directory .ui-state--empty').isVisible();
    await input.fill('');
    if (!empty) throw new Error("L'annuaire ne reagit pas a la recherche impossible.");
    return { empty };
  }],
  ['SEC-019', 'Detail d un role', async (page) => {
    await openTab(page, 'roles');
    const role = await requireVisible(page.locator('.security-role-list-item'), 'Aucun role a selectionner.');
    await role.click();
    const heading = page.locator('.security-role-detail h3');
    await heading.waitFor();
    return { role: (await heading.innerText()).trim(), capabilitySections: await page.locator('.security-capability-section').count() };
  }],
  ['SEC-020', 'Protection des roles officiels', async (page) => {
    await openTab(page, 'roles');
    const roles = page.locator('.security-role-list-item');
    for (let index = 0; index < await roles.count(); index += 1) {
      await roles.nth(index).click();
      if (await page.getByText('R\u00f4le officiel prot\u00e9g\u00e9', { exact: true }).count()) return { protectedRoleFound: true };
    }
    throw new NotExecutedError('Aucun role officiel present dans les donnees courantes.');
  }],
  ['SEC-021', 'Ouverture du formulaire nouveau role', async (page) => {
    await openTab(page, 'roles');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouveau r\u00f4le' }), "Permission de creation de role absente.");
    await button.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Cr\u00e9er un r\u00f4le' }).waitFor();
    const checkboxes = await dialog.locator('input[type="checkbox"]').count();
    await cancelDialog(page);
    return { permissionChoices: checkboxes };
  }],
  ['SEC-022', 'Validation locale du nouveau role', async (page) => {
    await openTab(page, 'roles');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouveau r\u00f4le' }), "Permission de creation de role absente.");
    await button.click();
    const disabled = await page.getByRole('dialog').getByRole('button', { name: 'Confirmer' }).isDisabled();
    await cancelDialog(page);
    if (!disabled) throw new Error('La creation vide peut etre confirmee.');
    return { emptyFormConfirmationDisabled: disabled };
  }],
  ['SEC-023', 'Commandes d un role personnalise', async (page) => {
    await openTab(page, 'roles');
    const roles = page.locator('.security-role-list-item');
    for (let index = 0; index < await roles.count(); index += 1) {
      await roles.nth(index).click();
      const footer = page.locator('.security-role-detail footer');
      if (await footer.count()) return { editableRoleFound: true, inlineEditors: await page.locator('.security-inline-editor').count() };
    }
    throw new NotExecutedError('Aucun role personnalise modifiable present.');
  }],
  ['SEC-024', 'Confirmation d etat d un role personnalise', async (page) => {
    await openTab(page, 'roles');
    const action = await requireVisible(page.locator('.security-role-detail footer button'), 'Aucun role personnalise modifiable selectionne.');
    const label = (await action.innerText()).trim();
    await action.click();
    await page.getByRole('dialog').waitFor();
    await cancelDialog(page);
    return { action: label, submitted: false };
  }],
  ['SEC-025', 'Affichage des affectations ou de leur etat vide', async (page) => {
    await openTab(page, 'assignments');
    const rows = await page.locator('.security-table tbody tr').count();
    const empty = await page.locator('.security-panel .ui-state--empty').count();
    if (!rows && !empty) throw new Error('Ni affectation ni etat vide ne sont affiches.');
    return { rowCount: rows, empty: Boolean(empty) };
  }],
  ['SEC-026', 'Ouverture du formulaire nouvelle affectation', async (page) => {
    await openTab(page, 'assignments');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouvelle affectation' }), "Permission de creation d'affectation absente.");
    await button.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('heading', { name: 'Attribuer un r\u00f4le et un p\u00e9rim\u00e8tre' }).waitFor();
    const selects = await dialog.locator('select').count();
    await cancelDialog(page);
    return { selectCount: selects };
  }],
  ['SEC-027', 'Validation locale de la nouvelle affectation', async (page) => {
    await openTab(page, 'assignments');
    const button = await requireVisible(page.getByRole('button', { name: 'Nouvelle affectation' }), "Permission de creation d'affectation absente.");
    await button.click();
    const disabled = await page.getByRole('dialog').getByRole('button', { name: 'Confirmer' }).isDisabled();
    await cancelDialog(page);
    if (!disabled) throw new Error("L'affectation vide peut etre confirmee.");
    return { emptyFormConfirmationDisabled: disabled };
  }],
  ['SEC-028', 'Confirmation non destructive d une affectation', async (page) => {
    await openTab(page, 'assignments');
    const action = await requireVisible(page.locator('.security-table-action'), 'Aucune affectation actionnable dans les donnees courantes.');
    const label = (await action.innerText()).trim();
    await action.click();
    await page.getByRole('dialog').waitFor();
    await cancelDialog(page);
    return { action: label, submitted: false };
  }],
  ['SEC-029', 'Affichage des sessions ou de leur etat vide', async (page) => {
    await openTab(page, 'sessions');
    const rows = await page.locator('.security-table tbody tr').count();
    const empty = await page.locator('.ui-state--empty').count();
    if (!rows && !empty) throw new Error('Ni session ni etat vide ne sont affiches.');
    return { rowCount: rows, empty: Boolean(empty) };
  }],
  ['SEC-030', 'Recherche de sessions', async (page) => {
    await openTab(page, 'sessions');
    const input = page.getByPlaceholder('Utilisateur, appareil ou adresse r\u00e9seau');
    await input.fill('__certification_absent__');
    const empty = await page.locator('.ui-state--empty').isVisible();
    await input.fill('');
    if (!empty) throw new Error("La recherche impossible de session n'affiche pas l'etat vide.");
    return { empty };
  }],
  ['SEC-031', 'Confirmation de fermeture d une session', async (page) => {
    await openTab(page, 'sessions');
    const button = await requireVisible(page.getByRole('button', { name: 'Fermer cette connexion' }), 'Aucune session active revocable.');
    await button.click();
    await page.getByRole('dialog').waitFor();
    await cancelDialog(page);
    return { scope: 'single', submitted: false };
  }],
  ['SEC-032', 'Confirmation de fermeture de toutes les sessions', async (page) => {
    await openTab(page, 'sessions');
    const button = await requireVisible(page.getByRole('button', { name: 'Fermer toutes', exact: true }), 'Aucune session active revocable.');
    await button.click();
    await page.getByRole('dialog').waitFor();
    await cancelDialog(page);
    return { scope: 'all', submitted: false };
  }],
  ['SEC-033', 'Affichage et recherche des tentatives', async (page) => {
    await openTab(page, 'attempts');
    const input = page.getByPlaceholder('Nom, adresse e-mail ou adresse r\u00e9seau');
    await input.fill('__certification_absent__');
    const empty = await page.locator('.security-panel .ui-state--empty').isVisible();
    await input.fill('');
    if (!empty) throw new Error("La recherche impossible de tentative n'affiche pas l'etat vide.");
    return { empty };
  }],
  ['SEC-034', 'Filtre de resultat des tentatives', async (page) => {
    await openTab(page, 'attempts');
    const select = page.locator('.security-toolbar select');
    await select.selectOption('FAILED');
    const value = await select.inputValue();
    await select.selectOption('ALL');
    return { selectedValue: value };
  }],
  ['SEC-035', 'Affichage de l historique ou de son etat vide', async (page) => {
    await openTab(page, 'audit');
    const entries = await page.locator('.security-audit-list article').count();
    const empty = await page.locator('.security-panel .ui-state--empty').count();
    if (!entries && !empty) throw new Error("Ni historique ni etat vide n'est affiche.");
    return { entryCount: entries, empty: Boolean(empty) };
  }],
  ['SEC-036', 'Recherche et filtre de l historique', async (page) => {
    await openTab(page, 'audit');
    const input = page.getByPlaceholder('Action, acteur, cible ou motif');
    const select = page.locator('.security-toolbar select');
    await input.fill('__certification_absent__');
    const empty = await page.locator('.security-panel .ui-state--empty').isVisible();
    await select.selectOption('FAILED');
    const selectedValue = await select.inputValue();
    await input.fill('');
    await select.selectOption('ALL');
    if (!empty) throw new Error("La recherche impossible d'historique n'affiche pas l'etat vide.");
    return { empty, selectedValue };
  }],
  ['SEC-037', 'Sante console et requetes Securite', async () => {
    const consoleErrors = report.telemetry.console.filter((entry) => entry.type === 'error');
    const securityFailures = report.telemetry.failedRequests.filter((entry) => entry.url.includes('/api/') || entry.url.includes('/security'));
    const errorResponses = report.telemetry.requests.filter((entry) => entry.status >= 400 && (entry.url.includes('/api/') || entry.url.includes('/security')));
    if (consoleErrors.length || securityFailures.length || errorResponses.length) {
      throw new Error(`${consoleErrors.length} erreur(s) console, ${securityFailures.length} requete(s) echouee(s), ${errorResponses.length} reponse(s) HTTP en erreur.`);
    }
    return { consoleErrors: 0, failedSecurityRequests: 0, errorSecurityResponses: 0 };
  }],
];

async function runUiSubproof(id, page) {
  const subproof = UI_SUBPROOFS.find(([candidate]) => candidate === id);
  if (!subproof) throw new Error(`Sous-preuve UI inconnue: ${id}`);
  return subproof[2](page);
}

const externalBackendReason = 'Scenario transactionnel non execute par ce harnais Chrome non destructif; une preuve backend externe doit etre rattachee separement.';

const SCENARIOS = [
  ['SEC-001', 'Connexion Manager systeme', async () => {
    if (report.devInitialization.managerSession?.selectedActor !== 'MANAGER_SYSTEME') {
      throw new Error("La selection naturelle de l'acteur Manager systeme n'est pas prouvee.");
    }
    return report.devInitialization.managerSession;
  }],
  ['SEC-002', 'Ouverture du Centre Securite', async (page) => {
    await page.getByRole('heading', { name: 'Centre S\u00e9curit\u00e9', exact: true }).waitFor();
    return { url: page.url(), heading: 'Centre Securite' };
  }],
  ['SEC-003', 'Consultation des huit onglets', async (page) => {
    const headings = [];
    for (const tab of TABS) headings.push((await observeTab(page, tab.code)).heading);
    return { tabCount: headings.length, headings };
  }],
  ['SEC-004', 'Creation d un compte Plateforme', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-011', page) }))],
  ['SEC-005', 'Suspension d un compte', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-013', page) }))],
  ['SEC-006', 'Reactivation d un compte', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ lifecycleControlsVisible: await page.locator('.security-row-actions button').allTextContents() }))],
  ['SEC-007', 'Desactivation d un compte', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ lifecycleControlsVisible: await page.locator('.security-row-actions button').allTextContents() }))],
  ['SEC-008', 'Deverrouillage d un compte', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ lifecycleControlsVisible: await page.locator('.security-row-actions button').allTextContents() }))],
  ['SEC-009', 'Reinitialisation du mot de passe', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ lifecycleControlsVisible: await page.locator('.security-row-actions button').allTextContents() }))],
  ['SEC-010', 'Creation d un administrateur Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-015', page) }))],
  ['SEC-011', 'Affectation d un compte existant comme administrateur Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => {
    const button = await requireVisible(page.getByRole('button', { name: 'Ajouter', exact: true }), "Bouton d'ajout indisponible.");
    await button.click();
    const existing = page.getByRole('dialog').getByLabel('Compte existant');
    await existing.check();
    return { existingAccountModeVisible: true };
  })],
  ['SEC-012', 'Ajout d un second administrateur Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-014', page) }))],
  ['SEC-013', 'Protection du dernier administrateur Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason)],
  ['SEC-014', 'Refus transactionnel du dernier administrateur', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason)],
  ['SEC-015', 'Remplacement d un administrateur Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => ({ replaceButtons: await page.getByRole('button', { name: /Remplacer/ }).count() }))],
  ['SEC-016', 'Creation d un administrateur Ecole par l Organisation', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => ({ governancePanels: await page.locator('.security-split > article').count() }))],
  ['SEC-017', 'Contrainte mono-ecole d un administrateur Ecole', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason)],
  ['SEC-018', 'Refus d une double affectation administrateur Ecole', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason)],
  ['SEC-019', 'Intervention Plateforme sur un administrateur Ecole', (page) => mutationNotExecuted(page, 'administrators', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-016', page) }))],
  ['SEC-020', 'Motif obligatoire pour les actions sensibles', (page) => mutationNotExecuted(page, 'accounts', externalBackendReason, async () => ({ reasonFields: await page.locator('textarea').count() }))],
  ['SEC-021', 'Audit des mutations de securite', (page) => mutationNotExecuted(page, 'audit', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-035', page) }))],
  ['SEC-022', 'Consultation d un role systeme protege', async (page) => runUiSubproof('SEC-020', page)],
  ['SEC-023', 'Creation d un role personnalise', (page) => mutationNotExecuted(page, 'roles', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-021', page) }))],
  ['SEC-024', 'Ajout d une permission a un role personnalise', (page) => mutationNotExecuted(page, 'roles', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-023', page) }))],
  ['SEC-025', 'Retrait d une permission d un role personnalise', (page) => mutationNotExecuted(page, 'roles', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-023', page) }))],
  ['SEC-026', 'Ajout et retrait d une restriction de role', (page) => mutationNotExecuted(page, 'roles', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-023', page) }))],
  ['SEC-027', 'Creation d une affectation de role', (page) => mutationNotExecuted(page, 'assignments', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-026', page) }))],
  ['SEC-028', 'Ajout et retrait d un scope', (page) => mutationNotExecuted(page, 'assignments', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-025', page) }))],
  ['SEC-029', 'Refus d un scope incoherent', (page) => mutationNotExecuted(page, 'assignments', externalBackendReason)],
  ['SEC-030', 'Consultation des sessions', async (page) => runUiSubproof('SEC-029', page)],
  ['SEC-031', 'Revocation d une session', (page) => mutationNotExecuted(page, 'sessions', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-031', page) }))],
  ['SEC-032', 'Revocation de toutes les sessions d un compte', (page) => mutationNotExecuted(page, 'sessions', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-032', page) }))],
  ['SEC-033', 'Consultation des tentatives de connexion', async (page) => runUiSubproof('SEC-033', page)],
  ['SEC-034', 'Verrouillage apres tentatives echouees', (page) => mutationNotExecuted(page, 'attempts', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-034', page) }))],
  ['SEC-035', 'Persistance de l audit apres redemarrage', (page) => mutationNotExecuted(page, 'audit', externalBackendReason, async () => ({ ui: await runUiSubproof('SEC-035', page) }))],
  ['SEC-036', 'Isolation multi-tenant', (page) => mutationNotExecuted(page, 'overview', externalBackendReason)],
  ['SEC-037', 'Certification mobile sans overflow', async () => {
    const mobileWidths = new Set([430, 390, 360]);
    const checks = report.matrix.filter((entry) => mobileWidths.has(entry.width));
    const failures = checks.filter((entry) => entry.status !== 'passed');
    if (checks.length !== mobileWidths.size * TABS.length || failures.length) {
      throw new Error(`Matrice mobile incomplete ou en echec: ${checks.length} controles, ${failures.length} echec(s).`);
    }
    return { widths: [...mobileWidths], checks: checks.length, screenshots: checks.map((entry) => entry.evidence.screenshot) };
  }],
];

async function runScenarios(page) {
  for (const [id, title, execute] of SCENARIOS) {
    const consoleStart = report.telemetry.console.length;
    const requestStart = report.telemetry.requests.length;
    const result = { id, title, status: 'not_executed', startedAt: new Date().toISOString(), finishedAt: null, evidence: null };
    try {
      result.evidence = await execute(page);
      result.status = 'passed';
    } catch (error) {
      if (error instanceof NotExecutedError) {
        result.notExecutedReason = error.message;
        result.evidence = error.evidence;
      } else {
        result.status = 'failed';
        result.error = serializeError(error);
      }
      await cancelDialog(page).catch(() => undefined);
    }
    result.telemetry = {
      consoleEventIndexes: Array.from({ length: report.telemetry.console.length - consoleStart }, (_, index) => consoleStart + index),
      requestIndexes: Array.from({ length: report.telemetry.requests.length - requestStart }, (_, index) => requestStart + index),
    };
    result.finishedAt = new Date().toISOString();
    report.scenarios.push(result);
  }
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true, timeout: 30000 });
  } catch (chromeError) {
    try {
      return await chromium.launch({ headless: true, timeout: 30000 });
    } catch (bundledError) {
      bundledError.message = `Chrome puis Chromium Playwright indisponibles. Chrome: ${chromeError.message}. Chromium: ${bundledError.message}`;
      throw bundledError;
    }
  }
}

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  for (const [id, title] of SCENARIOS) report.scenarios.push({ id, title, status: 'not_executed', evidence: null });
  writeReport();

  let browser;
  try {
    await waitForDev();
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: VIEWPORT_HEIGHT }, locale: 'fr-FR' });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    attachTelemetry(page);
    await initializeManagerThroughDevUi(page);
    await page.goto(`${BASE_URL}/app/security`, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByRole('heading', { name: 'Centre S\u00e9curit\u00e9', exact: true }).waitFor({ timeout: 60000 });

    // Les navigations précédant l'entrée dans le centre peuvent annuler les lectures de la page précédente.
    report.telemetry.console = [];
    report.telemetry.requests = [];
    report.telemetry.failedRequests = [];

    report.scenarios = [];
    await runMatrix(page);
    await runScenarios(page);
  } catch (error) {
    report.fatalError = serializeError(error);
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    report.finishedAt = new Date().toISOString();
    const scenarioCounts = { passed: 0, failed: 0, not_executed: 0 };
    const matrixCounts = { passed: 0, failed: 0, not_executed: 0 };
    for (const scenario of report.scenarios) scenarioCounts[scenario.status] += 1;
    for (const entry of report.matrix) matrixCounts[entry.status] += 1;
    const consoleErrors = report.telemetry.console.filter((entry) => entry.type === 'error');
    const failedSecurityRequests = report.telemetry.failedRequests.filter((entry) => entry.url.includes('/api/') || entry.url.includes('/security'));
    const errorSecurityResponses = report.telemetry.requests.filter((entry) => entry.status >= 400 && (entry.url.includes('/api/') || entry.url.includes('/security')));
    report.summary = {
      scenarioCounts,
      matrixCounts,
      expectedScenarios: 37,
      expectedMatrixChecks: TABS.length * VIEWPORTS.length,
      technicalHealth: {
        consoleErrors: consoleErrors.length,
        failedSecurityRequests: failedSecurityRequests.length,
        errorSecurityResponses: errorSecurityResponses.length,
      },
      certified: !report.fatalError
        && scenarioCounts.failed === 0
        && scenarioCounts.not_executed === 0
        && matrixCounts.failed === 0
        && consoleErrors.length === 0
        && failedSecurityRequests.length === 0
        && errorSecurityResponses.length === 0
        && report.matrix.length === TABS.length * VIEWPORTS.length,
    };
    writeReport();
    console.log(JSON.stringify({ report: REPORT_PATH, ...report.summary }, null, 2));
    if (!report.summary.certified) process.exitCode = 1;
  }
}

main();
