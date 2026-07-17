const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const phase = process.argv[2];
const frontendUrl = process.env.CERT_FRONTEND_URL ?? 'http://127.0.0.1:4174';
const backendUrl = process.env.CERT_BACKEND_URL ?? 'http://127.0.0.1:3100';
const statePath = process.env.CERT_BROWSER_STATE_PATH;
const password = process.env.CERT_BOOTSTRAP_PASSWORD;
const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'authentication-bootstrap-certification');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`Reponse non JSON recue avec le statut ${response.status()}.`);
  }
}

async function certifyInitialLaunch() {
  assert(statePath, 'CERT_BROWSER_STATE_PATH est obligatoire.');
  assert(password, 'CERT_BOOTSTRAP_PASSWORD est obligatoire.');
  fs.mkdirSync(artifactDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const unexpectedErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      unexpectedErrors.push(message.text());
    }
  });

  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/initialisation/, { timeout: 60_000 });
  await page.getByRole('heading', { name: /Initialisez votre plateforme/i }).waitFor();
  await page.screenshot({ path: path.join(artifactDir, 'initialisation-desktop-1440.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(artifactDir, 'initialisation-mobile-390.png'), fullPage: true });
  const card = await page.locator('.auth-card').boundingBox();
  assert(card && card.x >= 0 && card.x + card.width <= 391, 'La page deborde horizontalement sur mobile.');
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.getByLabel('Nom', { exact: true }).fill('Certification');
  await page.getByLabel('Postnom', { exact: true }).fill('Plateforme');
  await page.getByLabel(/Pr.nom/i).fill('Manager');
  await page.getByLabel('Adresse e-mail').fill('certification.bootstrap@educsync.local');
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByLabel(/Confirmer le mot de passe/i).fill(password);

  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/auth/initialisation') && response.request().method() === 'POST',
  { timeout: 60_000 });
  await page.getByRole('button', { name: 'Initialiser EduSync' }).click();
  const response = await responsePromise;
  const body = await response.json();
  assert(response.status() === 201, `Initialisation refusee avec le statut ${response.status()}.`);
  assert(!Object.prototype.hasOwnProperty.call(body, 'refreshToken'), 'Le refresh token est expose au navigateur.');
  await page.waitForURL(/\/app(?:\/|$)/, { timeout: 60_000 });
  await page.locator('.erp-shell').waitFor({ timeout: 60_000 });

  const cookies = (await context.cookies()).filter(({ name }) => ['access_token', 'refresh_token'].includes(name));
  assert(cookies.length === 2 && cookies.every(({ httpOnly }) => httpOnly), 'Les cookies Auth HttpOnly sont incomplets.');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.erp-shell').waitFor({ timeout: 60_000 });
  assert(unexpectedErrors.length === 0, `Erreurs console inattendues: ${unexpectedErrors.join(' | ')}`);

  await context.storageState({ path: statePath });
  fs.writeFileSync(path.join(artifactDir, 'initial-launch.json'), `${JSON.stringify({
    initialisationDetected: true,
    pageDisplayed: true,
    accountCreatedThroughBrowser: true,
    httpStatus: response.status(),
    refreshTokenHidden: true,
    sessionOpened: true,
    platformRedirect: true,
    reloadRestored: true,
    responsiveDesktopAndMobile: true,
  }, null, 2)}\n`);
  await context.close();
  await browser.close();
}

async function certifyAfterRestart() {
  assert(statePath && fs.existsSync(statePath), 'Etat navigateur temporaire introuvable.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    storageState: statePath,
  });
  const page = await context.newPage();

  await page.goto(`${frontendUrl}/app`, { waitUntil: 'domcontentloaded' });
  await page.locator('.erp-shell').waitFor({ timeout: 60_000 });
  assert(page.url().includes('/app'), 'La session ne survit pas au redemarrage backend.');
  const userSummary = await page.locator('.erp-user-menu__summary').innerText();
  assert(/Manager syst.me/i.test(userSummary), 'Le role Manager systeme n est pas restaure apres redemarrage.');
  const shellText = await page.locator('.erp-shell').innerText();
  assert(/Plateforme/i.test(shellText), 'Le perimetre Plateforme n est pas restaure apres redemarrage.');

  const stateResponse = await fetch(`${backendUrl}/api/auth/initialisation`);
  const stateBody = await readJson(stateResponse);
  assert(stateResponse.ok && stateBody.initialisationRequise === false, 'Le bootstrap s est rouvert apres redemarrage.');

  await page.goto(`${frontendUrl}/initialisation`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/app(?:\/|$)/, { timeout: 60_000 });

  const secondResponse = await fetch(`${backendUrl}/api/auth/initialisation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: 'Second',
      postnom: 'Responsable',
      prenom: 'Refuse',
      email: 'second.bootstrap@educsync.local',
      motDePasse: password,
      confirmationMotDePasse: password,
    }),
  });
  const secondBody = await readJson(secondResponse);
  assert(secondResponse.status === 409, `Le second bootstrap a retourne ${secondResponse.status}.`);
  assert(!JSON.stringify(secondBody).includes('stack'), 'Le refus expose une information technique.');

  await page.screenshot({ path: path.join(artifactDir, 'plateforme-apres-redemarrage.png'), fullPage: true });
  fs.writeFileSync(path.join(artifactDir, 'after-restart.json'), `${JSON.stringify({
    accountAndSessionPersisted: true,
    managerRoleRestored: true,
    platformScopeRestored: true,
    bootstrapStillClosed: true,
    initializationRouteRedirected: true,
    secondBootstrapRejected: true,
    secondBootstrapStatus: secondResponse.status,
  }, null, 2)}\n`);
  await context.close();
  await browser.close();
}

async function certifyRoleAfterRestart() {
  assert(password, 'CERT_BOOTSTRAP_PASSWORD est obligatoire.');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${frontendUrl}/connexion`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Adresse e-mail').fill('certification.bootstrap@educsync.local');
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/\/app(?:\/|$)/, { timeout: 60_000 });
  await page.locator('.erp-shell').waitFor({ timeout: 60_000 });
  const userSummary = await page.locator('.erp-user-menu__summary').innerText();
  assert(/Manager syst.me/i.test(userSummary), 'Le role Manager systeme n est pas restaure apres redemarrage.');
  const shellText = await page.locator('.erp-shell').innerText();
  assert(/Plateforme/i.test(shellText), 'Le perimetre Plateforme n est pas restaure apres redemarrage.');
  fs.writeFileSync(path.join(artifactDir, 'role-after-restart.json'), `${JSON.stringify({
    accountLoginAfterRestart: true,
    managerRoleRestored: true,
    platformScopeRestored: true,
  }, null, 2)}\n`);
  await context.close();
  await browser.close();
}

async function main() {
  if (phase === 'initial') return certifyInitialLaunch();
  if (phase === 'after-restart') return certifyAfterRestart();
  if (phase === 'role-after-restart') return certifyRoleAfterRestart();
  throw new Error('Utilisez la phase initial, after-restart ou role-after-restart.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
