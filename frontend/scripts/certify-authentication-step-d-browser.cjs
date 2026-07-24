const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = 'http://localhost:4174';
const artifactDir = path.resolve(__dirname, '..', 'artifacts', 'authentication-step-d');
const credentials = {
  email: 'dev.manager_systeme@educsync.local',
  password: 'EducSyn.dev.session.2026',
};

const viewports = [
  ['desktop-1440', 1440, 1000],
  ['desktop-1280', 1280, 900],
  ['tablet-1024', 1024, 900],
  ['tablet-768', 768, 900],
  ['mobile-430', 430, 900],
  ['mobile-390', 390, 844],
  ['mobile-360', 360, 800],
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function prepareDeveloperIdentity() {
  const response = await fetch('http://localhost:3000/api/auth/dev/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorCode: 'MANAGER_SYSTEME', deviceId: 'auth-step-d-preparation' }),
  });
  assert(response.ok, `Preparation du profil developpeur impossible (${response.status}).`);
  const session = await response.json();
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${session.accessToken}`,
      'x-session-id': session.sessionId,
    },
    body: JSON.stringify({ sessionId: session.sessionId }),
  });
}

async function captureResponsiveLogin(browser) {
  for (const [name, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${baseUrl}/connexion`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Se connecter' }).waitFor();
    await page.screenshot({ path: path.join(artifactDir, `${name}.png`), fullPage: true });
    const cardBox = await page.locator('.auth-card').boundingBox();
    assert(cardBox, `Carte de connexion absente en ${name}.`);
    assert(cardBox.x >= 0 && cardBox.x + cardBox.width <= width + 1, `Debordement horizontal en ${name}.`);
    await page.close();
  }
}

async function run() {
  console.log('auth-certification: start');
  await prepareDeveloperIdentity();
  console.log('auth-certification: developer identity ready');
  fs.mkdirSync(artifactDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
  });
  page.on('response', async (response) => {
    if (response.status() >= 400) {
      const item = { url: response.url(), status: response.status() };
      httpErrors.push(item);
      item.headers = await response.request().allHeaders();
      item.body = await response.text().catch(() => '');
    }
  });

  await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/connexion/, { timeout: 30000 });
  console.log('auth-certification: private guard ok');
  assert(page.url().includes('/connexion'), 'Une route privee reste accessible sans session.');

  await page.getByLabel('Adresse e-mail').fill('inconnu@educsync.local');
  await page.locator('input[name="password"]').fill('MotDePasseInvalide!');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByRole('alert').waitFor();
  console.log('auth-certification: invalid login ok');
  assert(!(await page.getByRole('alert').innerText()).includes('stack'), 'Une erreur technique est visible.');

  await page.getByLabel('Adresse e-mail').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.waitForFunction(() => {
    const button = document.querySelector('.auth-submit');
    return button instanceof HTMLButtonElement && !button.disabled;
  });
  const loginResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/login') && response.request().method() === 'POST',
  { timeout: 60000 });
  await page.getByRole('button', { name: 'Se connecter' }).click();
  const loginResponse = await loginResponsePromise;
  const loginResponseBody = await loginResponse.json();
  await page.waitForURL(/\/app(?:\/|$)/, { timeout: 60000 });
  console.log('auth-certification: valid login ok');
  console.log(`auth-certification: login response keys=${Object.keys(loginResponseBody ?? {}).join(',')}`);
  assert(loginResponseBody && !('refreshToken' in loginResponseBody), 'Le refresh token est expose au JavaScript.');

  const localSnapshot = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  const serializedStorage = JSON.stringify(localSnapshot);
  assert(!serializedStorage.includes(credentials.password), 'Le mot de passe est persiste dans le navigateur.');
  assert(!serializedStorage.includes('refreshToken'), 'Un refresh token est persiste dans le navigateur.');
  assert(!serializedStorage.includes('accessToken'), 'Un access token est persiste dans le navigateur.');

  const authCookies = (await context.cookies()).filter((cookie) =>
    ['access_token', 'refresh_token'].includes(cookie.name));
  console.log(`auth-certification: cookies=${(await context.cookies()).map((cookie) => cookie.name).join(',')}`);
  assert(authCookies.length === 2, 'Les deux cookies Auth ne sont pas presents.');
  assert(authCookies.every((cookie) => cookie.httpOnly), 'Un cookie Auth est accessible au JavaScript.');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('.erp-shell').waitFor({ timeout: 60000 });
  console.log('auth-certification: reload ok');
  assert(page.url().includes('/app'), 'La session ne survit pas a une actualisation.');

  const secondTab = await context.newPage();
  await secondTab.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded' });
  await secondTab.locator('.erp-shell').waitFor({ timeout: 60000 });
  console.log('auth-certification: second tab ok');
  assert(secondTab.url().includes('/app'), 'La session ne se restaure pas dans un nouvel onglet.');
  await secondTab.close();

  await page.locator('.erp-user-menu__summary').click();
  const logout = page.getByRole('button', { name: /se deconnecter|se déconnecter/i });
  await logout.waitFor();
  await page.getByRole('button', { name: /se deconnecter|se déconnecter/i }).click();
  await page.waitForURL(/\/connexion/, { timeout: 30000 });
  console.log('auth-certification: logout ok');
  const remainingAuthCookies = (await context.cookies()).filter((cookie) =>
    ['access_token', 'refresh_token'].includes(cookie.name));
  assert(remainingAuthCookies.length === 0, 'Les cookies Auth subsistent apres deconnexion.');

  await captureResponsiveLogin(browser);
  console.log('auth-certification: responsive ok');
  console.log(`auth-certification: http errors=${JSON.stringify(httpErrors)}`);
  const unexpectedHttpErrors = httpErrors.filter((item) =>
    !(item.url.includes('/api/auth/login') && item.status === 401));
  assert(unexpectedHttpErrors.length === 0, `Erreurs HTTP inattendues: ${JSON.stringify(unexpectedHttpErrors)}`);
  const unexpectedConsoleErrors = consoleErrors.filter((message) =>
    !message.includes('Failed to load resource'));
  assert(unexpectedConsoleErrors.length === 0, `Erreurs console: ${unexpectedConsoleErrors.join(' | ')}`);
  const unexpectedFailedRequests = failedRequests.filter((item) => item.error !== 'net::ERR_ABORTED');
  assert(unexpectedFailedRequests.length === 0, `Requetes echouees: ${JSON.stringify(unexpectedFailedRequests)}`);

  const report = {
    verdict: 'AUTHENTIFICATION FRONTEND ETAPE D - PARCOURS NAVIGATEUR CERTIFIE',
    checks: {
      privateRouteGuard: true,
      humanLoginError: true,
      realLogin: true,
      refreshTokenHttpOnlyOnly: true,
      storageWithoutSecrets: true,
      reloadRestoration: true,
      multiTabRestoration: true,
      realLogout: true,
      responsiveViewports: viewports.map(([name]) => name),
    },
  };
  fs.writeFileSync(path.join(artifactDir, 'browser-certification.json'), `${JSON.stringify(report, null, 2)}\n`);
  await context.close();
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
