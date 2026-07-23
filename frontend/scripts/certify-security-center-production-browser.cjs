const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const phase = process.argv[2] || 'main';
const baseUrl = process.env.SECURITY_CERT_BASE_URL || 'http://127.0.0.1:4277';
const apiUrl = process.env.SECURITY_CERT_API_URL || 'http://127.0.0.1:3107';
const artifactDir = path.resolve(process.env.SECURITY_CERT_ARTIFACT_DIR || path.join(__dirname, '..', 'artifacts', 'security-production-certification'));
const reportPath = path.join(artifactDir, 'browser-report.json');
const ids = {
  orgA: '71000000-0000-4000-8000-000000000001',
  orgB: '71000000-0000-4000-8000-000000000002',
  schoolA1: '72000000-0000-4000-8000-000000000001',
  schoolA2: '72000000-0000-4000-8000-000000000002',
  schoolB1: '72000000-0000-4000-8000-000000000003',
};
const password = 'Certification#2026!';
const titles = [
  'Connexion Manager système', 'Ouverture du Centre Sécurité', 'Consultation des huit onglets',
  'Création d’un compte Plateforme', 'Suspension d’un compte', 'Réactivation d’un compte',
  'Désactivation d’un compte', 'Déverrouillage d’un compte', 'Réinitialisation du mot de passe',
  'Création d’un administrateur Organisation', 'Affectation d’un compte existant comme administrateur Organisation',
  'Ajout d’un second administrateur Organisation', 'Protection du dernier administrateur Organisation',
  'Refus transactionnel du dernier administrateur', 'Remplacement d’un administrateur Organisation',
  'Création d’un administrateur École par l’Organisation', 'Contrainte mono-école d’un administrateur École',
  'Refus d’une double affectation administrateur École', 'Intervention Plateforme sur un administrateur École',
  'Motif obligatoire pour les actions sensibles', 'Audit des mutations de sécurité',
  'Consultation d’un rôle système protégé', 'Création d’un rôle personnalisé',
  'Ajout d’une permission à un rôle personnalisé', 'Retrait d’une permission d’un rôle personnalisé',
  'Ajout et retrait d’une restriction de rôle', 'Création d’une affectation de rôle',
  'Ajout et retrait d’un périmètre', 'Refus d’un périmètre incohérent', 'Consultation des sessions',
  'Révocation d’une session', 'Révocation de toutes les sessions d’un compte',
  'Consultation des tentatives de connexion', 'Verrouillage après tentatives échouées',
  'Persistance de l’audit après redémarrage', 'Isolation multi-tenant', 'Certification responsive sans débordement',
];
const tabs = ['overview', 'accounts', 'administrators', 'roles', 'assignments', 'sessions', 'attempts', 'audit'];
const report = phase === 'restart' && fs.existsSync(reportPath)
  ? JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  : {
      schemaVersion: 2, certification: 'centre-securite-production', startedAt: new Date().toISOString(),
      finishedAt: null, environment: { baseUrl, apiUrl, databaseIsolation: 'dedicated-schema', browserProfile: 'temporary' },
      scenarios: [], responsiveMatrix: [], telemetry: { consoleErrors: [], expectedHttpRejections: [], requestFailures: [] }, summary: null,
    };
report.telemetry.expectedHttpRejections ||= [];
const requestTimeoutMs = 30000;

const save = () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const dataOf = (response) => {
  const body = response?.body;
  if (body && typeof body === 'object' && 'data' in body) return body.data;
  if (body && typeof body === 'object' && 'donnee' in body) return dataOf({ body: body.donnee });
  return body;
};
const listOf = (response) => {
  const value = dataOf(response);
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.elements)) return value.elements;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.donnee)) return value.donnee;
  return [];
};
const accountId = (account) => account.id || account.idUtilisateur || account.id_utilisateur;
const accountState = (account) => account.etat || account.etatCompte || account.etat_compte;
const accountLockedUntil = (account) => account.verrouilleJusqua || account.compteVerrouilleJusqua || account.compte_verrouille_jusqua;
const assignmentId = (assignment) => assignment.idAffectation || assignment.id_affectation_utilisateur;
const assignmentState = (assignment) => assignment.etatAffectation || assignment.etat_affectation || assignment.etat;
const sessionId = (session) => session.id || session.idSession || session.id_session_utilisateur;
const sessionState = (session) => session.statut || session.etat || session.status;

async function launchBrowser() {
  try { return await chromium.launch({ channel: 'chrome', headless: true }); }
  catch { return chromium.launch({ headless: true }); }
}

async function initializeManager(page) {
  await page.goto(`${baseUrl}/connexion`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 120000 });
  await page.locator('input[name="email"]').fill('manager.certification@cert.educsyn.cd');
  await page.locator('input[name="password"]').fill(password);
  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/auth/login') && response.request().method() === 'POST',
    { timeout: 60000 },
  );
  await page.getByRole('button', { name: /Se connecter/i }).click();
  const loginResponse = await loginResponsePromise;
  const loginBody = await loginResponse.json();
  assert(loginResponse.ok(), `Connexion Manager refusee: HTTP ${loginResponse.status()}`);
  const result = dataOf({ body: loginBody });
  assert(result?.acteurCode === 'MANAGER_SYSTEME', 'La connexion reelle n a pas active le profil Manager systeme.');
  await page.waitForURL((url) => url.pathname.startsWith('/app/'), { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 60000 });
  await page.goto(`${baseUrl}/app/security`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('.security-center h1').waitFor({ state: 'visible', timeout: 60000 });
  return {
    accessToken: result.accessToken,
    sessionId: result.sessionId,
    userId: result.utilisateur?.idUtilisateur,
    actorCode: result.acteurCode,
  };
}

async function request(page, auth, method, requestPath, body, scope = {}) {
  return page.evaluate(async (input) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
    try {
      const response = await fetch(`${input.apiUrl}${input.requestPath}`, {
        method: input.method, credentials: 'include', signal: controller.signal,
        headers: {
          Accept: 'application/json', ...(input.body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...(input.auth?.accessToken ? { authorization: `Bearer ${input.auth.accessToken}` } : {}),
          ...(input.auth?.sessionId ? { 'x-session-id': input.auth.sessionId } : {}),
          ...(input.auth?.userId ? { 'x-user-id': input.auth.userId } : {}),
          ...(input.auth?.actorCode ? { 'x-role-actif': input.auth.actorCode } : {}),
          ...(input.scope.organisationId ? { 'x-organisation-id': input.scope.organisationId } : {}),
          ...(input.scope.ecoleId ? { 'x-ecole-id': input.scope.ecoleId, 'x-tenant-id': input.scope.ecoleId } : {}),
          'idempotency-key': `security-cert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
      });
      let parsed = null;
      try { parsed = await response.json(); } catch { parsed = await response.text().catch(() => null); }
      return { status: response.status, ok: response.ok, body: parsed };
    } finally {
      clearTimeout(timeout);
    }
  }, { apiUrl, auth, method, requestPath, body, scope, timeoutMs: requestTimeoutMs });
}

async function devSession(page, actorCode, scope = {}, deviceId = `cert-${actorCode}-${Date.now()}`) {
  const response = await page.evaluate(async (input) => {
    const http = await fetch(`${input.apiUrl}/api/auth/dev/session`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorCode: input.actorCode, organisationActiveId: input.scope.organisationId, ecoleActiveId: input.scope.ecoleId, deviceId: input.deviceId }),
    });
    return { status: http.status, body: await http.json() };
  }, { apiUrl, actorCode, scope, deviceId });
  assert(response.status === 200, `Session ${actorCode} refusée: ${JSON.stringify(response.body)}`);
  return { accessToken: response.body.accessToken, sessionId: response.body.sessionId, userId: response.body.utilisateur?.idUtilisateur, actorCode };
}

async function login(page, email, motDePasse, deviceId) {
  return page.evaluate(async (input) => {
    const http = await fetch(`${input.apiUrl}/api/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.email, motDePasse: input.motDePasse, deviceId: input.deviceId }),
    });
    let body = null; try { body = await http.json(); } catch { body = null; }
    return { status: http.status, body };
  }, { apiUrl, email, motDePasse, deviceId });
}

async function runScenario(id, execute) {
  const result = { id, title: titles[Number(id.slice(4)) - 1], status: 'failed', startedAt: new Date().toISOString(), evidence: null };
  process.stdout.write(`[${id}] ${result.title}...\n`);
  try { result.evidence = await execute(); result.status = 'passed'; }
  catch (error) { result.error = { message: error.message, stack: error.stack }; }
  result.finishedAt = new Date().toISOString();
  report.scenarios = report.scenarios.filter((entry) => entry.id !== id).concat(result);
  save();
  process.stdout.write(`[${id}] ${result.status === 'passed' ? 'OK' : 'ECHEC'}\n`);
  if (result.status !== 'passed') throw new Error(`${id} ${result.title}: ${result.error.message}`);
}

async function openTab(page, code) {
  await page.getByRole('tab').nth(tabs.indexOf(code)).click();
  await page.waitForTimeout(80);
}
async function refresh(page) {
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click();
  await page.waitForTimeout(250);
}
async function accounts(page, manager) {
  const response = await request(page, manager, 'GET', '/api/v1/security/accounts?limite=100');
  assert(response.status === 200, `Liste comptes HTTP ${response.status}`);
  return listOf(response);
}
async function findAccount(page, manager, email) {
  const account = (await accounts(page, manager)).find((item) => item.email === email);
  assert(account, `Compte ${email} introuvable après relecture.`);
  return account;
}
async function createAccount(page, manager, name, email, role = 'SUPPORT_SYSTEME') {
  const response = await request(page, manager, 'POST', '/api/v1/security/accounts/platform', {
    nomComplet: name, email, motDePasseInitial: password, codeRole: role, motif: 'Certification automatisée du Centre Sécurité',
  });
  assert(response.status === 201, `Création compte HTTP ${response.status}: ${JSON.stringify(response.body)}`);
  return findAccount(page, manager, email);
}

async function runMain(page, manager) {
  const state = {};
  const email = (name) => `${name}.certification@cert.educsyn.cd`;
  const roleCode = 'CUSTOM_RESPONSABLE_CERTIFICATION';
  await runScenario('SEC-001', async () => ({ actor: manager.actorCode, userId: manager.userId, sessionId: manager.sessionId }));
  await runScenario('SEC-002', async () => ({ url: page.url(), title: await page.getByRole('heading', { name: 'Centre Sécurité', exact: true }).innerText() }));
  await runScenario('SEC-003', async () => {
    await page.getByRole('tab').nth(7).waitFor({ state: 'visible', timeout: 120000 });
    const labels = await page.getByRole('tab').allTextContents();
    assert(labels.length === 8, `${labels.length} onglets visibles au lieu de 8.`);
    for (const tab of tabs) await openTab(page, tab);
    return { labels: labels.map((item) => item.trim()) };
  });
  await runScenario('SEC-004', async () => {
    state.main = await createAccount(page, manager, 'Compte Cycle Certification', email('cycle'));
    await refresh(page); await openTab(page, 'accounts');
    assert((await page.locator('body').innerText()).includes(email('cycle')), 'Le compte créé n’est pas visible dans le Centre.');
    return { accountId: accountId(state.main), email: email('cycle') };
  });
  await runScenario('SEC-005', async () => {
    const response = await request(page, manager, 'PATCH', `/api/v1/security/accounts/${accountId(state.main)}/suspend`, { motif: 'Test suspension certifié' });
    assert(response.status === 200, `Suspension HTTP ${response.status}`);
    const reread = await findAccount(page, manager, email('cycle')); assert(accountState(reread) === 'SUSPENDED', `État obtenu: ${accountState(reread)}`);
    return { state: accountState(reread) };
  });
  await runScenario('SEC-006', async () => {
    const response = await request(page, manager, 'PATCH', `/api/v1/security/accounts/${accountId(state.main)}/reactivate`, { motif: 'Test réactivation certifié' });
    assert(response.status === 200, `Réactivation HTTP ${response.status}`);
    const reread = await findAccount(page, manager, email('cycle')); assert(accountState(reread) === 'ACTIVE', `État obtenu: ${accountState(reread)}`);
    return { state: accountState(reread) };
  });
  await runScenario('SEC-007', async () => {
    const target = await createAccount(page, manager, 'Compte Désactivation Certification', email('disabled'));
    const response = await request(page, manager, 'PATCH', `/api/v1/security/accounts/${accountId(target)}/deactivate`, { motif: 'Test désactivation certifié' });
    assert(response.status === 200, `Désactivation HTTP ${response.status}`);
    const reread = await findAccount(page, manager, email('disabled')); assert(accountState(reread) === 'DISABLED', `État obtenu: ${accountState(reread)}`);
    return { state: accountState(reread) };
  });
  await runScenario('SEC-008', async () => {
    const target = await createAccount(page, manager, 'Compte Verrouillage Certification', email('locked'));
    for (let index = 0; index < 5; index += 1) await login(page, email('locked'), 'MotDePasseInvalide#2026', `lock-${index}`);
    const before = await findAccount(page, manager, email('locked')); assert(accountLockedUntil(before), 'Le compte n’est pas verrouillé après cinq échecs.');
    state.lockProof = { accountId: accountId(target), lockedAt: accountLockedUntil(before) };
    const response = await request(page, manager, 'PATCH', `/api/v1/security/accounts/${accountId(target)}/unlock`, { motif: 'Déverrouillage de certification' });
    assert(response.status === 200, `Déverrouillage HTTP ${response.status}`);
    const after = await findAccount(page, manager, email('locked')); assert(!accountLockedUntil(after), 'Le verrouillage subsiste après l’action.');
    return { lockedBefore: true, lockedAfter: false };
  });
  await runScenario('SEC-009', async () => {
    const support = await devSession(page, 'SUPPORT_SYSTEME', {}, 'reset-cert-session');
    const response = await request(page, manager, 'PATCH', `/api/v1/security/accounts/${support.userId}/reset-password`, { nouveauMotDePasse: 'Nouveau#Certification2026!', motif: 'Réinitialisation certifiée' });
    assert(response.status === 200, `Réinitialisation HTTP ${response.status}`);
    const sessions = listOf(await request(page, manager, 'GET', `/api/v1/security/sessions?utilisateurId=${encodeURIComponent(support.userId)}`));
    const previousSession = sessions.find((item) => sessionId(item) === support.sessionId);
    assert(previousSession && sessionState(previousSession) === 'REVOQUEE', 'La session antérieure n’a pas été révoquée.');
    return { userId: support.userId, previousSessionRevoked: true };
  });
  await runScenario('SEC-010', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/organizations/${ids.orgA}/administrators`, {
      nomComplet: 'Administrateur Organisation A', email: email('org.admin'), motDePasseInitial: password, motif: 'Gouvernance Organisation certifiée',
    });
    assert(response.status === 201, `Administrateur Organisation HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    state.orgAdmin = await findAccount(page, manager, email('org.admin'));
    state.orgAuth = await devSession(page, 'ADMIN_SYSTEME_ORGANISATION', { organisationId: ids.orgA }, 'org-admin-certification');
    const admins = listOf(await request(page, manager, 'GET', `/api/v1/security/organizations/${ids.orgA}/administrators`));
    assert(admins.some((item) => item.email === email('org.admin')), 'Administrateur Organisation absent après relecture.');
    return { organisationId: ids.orgA, accountId: accountId(state.orgAdmin) };
  });
  await runScenario('SEC-011', async () => {
    const account = await createAccount(page, manager, 'Compte Existant Organisation', email('org.existing'));
    const response = await request(page, manager, 'POST', `/api/v1/security/organizations/${ids.orgA}/administrators`, { idUtilisateur: accountId(account), motif: 'Affectation compte existant certifiée' });
    assert(response.status === 201, `Affectation existante HTTP ${response.status}`);
    return { accountId: accountId(account), organisationId: ids.orgA };
  });
  await runScenario('SEC-012', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/organizations/${ids.orgA}/administrators`, {
      nomComplet: 'Second Administrateur Organisation', email: email('org.second'), motDePasseInitial: password, motif: 'Continuité de gouvernance certifiée',
    });
    assert(response.status === 201, `Second administrateur HTTP ${response.status}`);
    const admins = listOf(await request(page, manager, 'GET', `/api/v1/security/organizations/${ids.orgA}/administrators`));
    assert(admins.filter((item) => assignmentState(item) === 'ACTIVE').length >= 2, 'Le second administrateur n’est pas actif.');
    return { activeAdministrators: admins.filter((item) => assignmentState(item) === 'ACTIVE').length };
  });
  await runScenario('SEC-013', async () => {
    const created = await request(page, manager, 'POST', `/api/v1/security/organizations/${ids.orgB}/administrators`, {
      nomComplet: 'Dernier Administrateur Organisation B', email: email('org.last'), motDePasseInitial: password, motif: 'Préparation protection dernier administrateur',
    });
    assert(created.status === 201, `Préparation dernier admin HTTP ${created.status}`);
    const admins = listOf(await request(page, manager, 'GET', `/api/v1/security/organizations/${ids.orgB}/administrators`));
    const target = admins.find((item) => item.email === email('org.last')); assert(target, 'Dernier administrateur introuvable.');
    state.lastAdminAssignment = assignmentId(target);
    const refused = await request(page, manager, 'PATCH', `/api/v1/security/affectations/${assignmentId(target)}/deactivate`, { motif: 'Tentative de retrait du dernier administrateur' });
    assert(refused.status === 409, `Le dernier administrateur a produit HTTP ${refused.status} au lieu de 409.`);
    return { status: refused.status, code: refused.body?.error?.code };
  });
  await runScenario('SEC-014', async () => {
    const [first, second] = await Promise.all([
      request(page, manager, 'PATCH', `/api/v1/security/affectations/${state.lastAdminAssignment}/deactivate`, { motif: 'Concurrence A dernier administrateur' }),
      request(page, manager, 'PATCH', `/api/v1/security/affectations/${state.lastAdminAssignment}/deactivate`, { motif: 'Concurrence B dernier administrateur' }),
    ]);
    assert(first.status === 409 && second.status === 409, `Résultats transactionnels inattendus: ${first.status}/${second.status}`);
    return { statuses: [first.status, second.status] };
  });
  await runScenario('SEC-015', async () => {
    const admins = listOf(await request(page, manager, 'GET', `/api/v1/security/organizations/${ids.orgA}/administrators`));
    const target = admins.find((item) => item.email === email('org.admin')); assert(target, 'Administrateur à remplacer introuvable.');
    const replacement = await createAccount(page, manager, 'Remplaçant Organisation A', email('org.replacement'));
    const response = await request(page, manager, 'POST', `/api/v1/security/organizations/${ids.orgA}/administrators/${assignmentId(target)}/replace`, { idUtilisateur: accountId(replacement), motif: 'Remplacement administrateur certifié' });
    assert(response.status === 200, `Remplacement HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    return { replacedAssignment: assignmentId(target), replacementId: accountId(replacement) };
  });
  await runScenario('SEC-016', async () => {
    const response = await request(page, state.orgAuth, 'POST', `/api/v1/security/organizations/${ids.orgA}/schools/${ids.schoolA1}/administrators`, {
      nomComplet: 'Administrateur Ecole A1', email: email('school.admin'), motDePasseInitial: password, motif: 'Administration locale certifiée',
    }, { organisationId: ids.orgA });
    assert(response.status === 201, `Création administrateur École HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    state.schoolAdmin = await findAccount(page, manager, email('school.admin'));
    return { schoolId: ids.schoolA1, accountId: accountId(state.schoolAdmin) };
  });
  await runScenario('SEC-017', async () => {
    const response = await request(page, state.orgAuth, 'POST', `/api/v1/security/organizations/${ids.orgA}/schools/${ids.schoolA2}/administrators`, { idUtilisateur: accountId(state.schoolAdmin), motif: 'Contrôle mono-école' }, { organisationId: ids.orgA });
    assert(response.status === 409, `Contrainte mono-école HTTP ${response.status} au lieu de 409.`);
    return { status: response.status, code: response.body?.error?.code };
  });
  await runScenario('SEC-018', async () => {
    const response = await request(page, state.orgAuth, 'POST', `/api/v1/security/organizations/${ids.orgA}/schools/${ids.schoolA1}/administrators`, { idUtilisateur: accountId(state.schoolAdmin), motif: 'Contrôle double affectation' }, { organisationId: ids.orgA });
    assert(response.status === 409, `Double affectation HTTP ${response.status} au lieu de 409.`);
    return { status: response.status, code: response.body?.error?.code };
  });
  await runScenario('SEC-019', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/emergency/organizations/${ids.orgB}/schools/${ids.schoolB1}/administrators`, {
      nomComplet: 'Administrateur Ecole B1 Urgence', email: email('school.emergency'), motDePasseInitial: password, motif: 'Continuité exceptionnelle certifiée',
    });
    assert(response.status === 201, `Intervention exceptionnelle HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    return { schoolId: ids.schoolB1, auditRequired: true };
  });
  await runScenario('SEC-020', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/emergency/organizations/${ids.orgB}/schools/${ids.schoolB1}/administrators`, { idUtilisateur: accountId(state.main), motif: '' });
    assert(response.status === 400 && response.body?.error?.code === 'SECURITY_REASON_REQUIRED', `Motif absent non refusé correctement: ${response.status}`);
    return { status: response.status, code: response.body.error.code };
  });

  await runScenario('SEC-021', async () => {
    const audit = listOf(await request(page, manager, 'GET', '/api/v1/security/audit/logs'));
    assert(audit.length > 0, 'Aucune mutation n’est visible dans l’audit.');
    state.auditMarker = audit[0]?.id_evenement || audit[0]?.id || audit[0]?.action;
    return { events: audit.length, marker: state.auditMarker };
  });
  await runScenario('SEC-022', async () => {
    const response = await request(page, manager, 'GET', '/api/v1/security/roles/MANAGER_SYSTEME');
    assert(response.status === 200, `Lecture rôle système HTTP ${response.status}`);
    const role = dataOf(response); assert(role.estSysteme === true, 'Le rôle MANAGER_SYSTEME n’est pas marqué système.');
    return { codeRole: role.codeRole, protected: role.estSysteme };
  });
  await runScenario('SEC-023', async () => {
    const response = await request(page, manager, 'POST', '/api/v1/security/roles', {
      codeRole: roleCode, nomRole: 'Responsable Certification', description: 'Rôle temporaire de certification',
      niveauAcces: 'ORGANISATION', permissions: ['audit.security.read'], motif: 'Création rôle de certification',
    });
    assert(response.status === 201, `Création rôle HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    return { codeRole: roleCode };
  });
  await runScenario('SEC-024', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/roles/${roleCode}/permissions`, { permission: 'security.sessions.read', motif: 'Ajout permission certifié' });
    assert(response.status === 201, `Ajout permission HTTP ${response.status}`);
    const role = dataOf(await request(page, manager, 'GET', `/api/v1/security/roles/${roleCode}`));
    assert(role.permissions.includes('security.sessions.read'), 'Permission absente après relecture.');
    return { permission: 'security.sessions.read', present: true };
  });
  await runScenario('SEC-025', async () => {
    const response = await request(page, manager, 'DELETE', `/api/v1/security/roles/${roleCode}/permissions/security.sessions.read`, { motif: 'Retrait permission certifié' });
    assert(response.status === 200, `Retrait permission HTTP ${response.status}`);
    const role = dataOf(await request(page, manager, 'GET', `/api/v1/security/roles/${roleCode}`));
    assert(!role.permissions.includes('security.sessions.read'), 'Permission encore présente après retrait.');
    return { permission: 'security.sessions.read', present: false };
  });
  await runScenario('SEC-026', async () => {
    const code = 'INTERDICTION_CAISSE';
    const added = await request(page, manager, 'POST', `/api/v1/security/roles/${roleCode}/restrictions`, { codeRestriction: code, motif: 'Ajout restriction certifié' });
    assert(added.status === 201, `Ajout restriction HTTP ${added.status}`);
    let role = dataOf(await request(page, manager, 'GET', `/api/v1/security/roles/${roleCode}`));
    assert(role.restrictions.includes(code), 'Restriction absente après ajout.');
    const removed = await request(page, manager, 'DELETE', `/api/v1/security/roles/${roleCode}/restrictions/${code}`, { motif: 'Retrait restriction certifié' });
    assert(removed.status === 200, `Retrait restriction HTTP ${removed.status}`);
    role = dataOf(await request(page, manager, 'GET', `/api/v1/security/roles/${roleCode}`));
    assert(!role.restrictions.includes(code), 'Restriction encore présente après retrait.');
    return { codeRestriction: code, cycleComplete: true };
  });
  await runScenario('SEC-027', async () => {
    const account = await createAccount(page, manager, 'Compte Affectation Certification', email('assignment'));
    const response = await request(page, manager, 'POST', '/api/v1/security/affectations', {
      idUtilisateur: accountId(account), codeRole: roleCode, niveau: 'ORGANISATION', organisationId: ids.orgA, motif: 'Affectation certifiée',
    });
    assert(response.status === 201, `Création affectation HTTP ${response.status}: ${JSON.stringify(response.body)}`);
    const assignments = listOf(await request(page, manager, 'GET', `/api/v1/security/assignments?utilisateurId=${encodeURIComponent(accountId(account))}`));
    const assignment = assignments.find((item) => item.role === roleCode || item.code_role === roleCode);
    assert(assignment, 'Affectation absente après relecture.');
    state.assignmentId = assignmentId(assignment);
    return { assignmentId: state.assignmentId };
  });
  await runScenario('SEC-028', async () => {
    const added = await request(page, manager, 'POST', `/api/v1/security/affectations/${state.assignmentId}/scopes`, { typeScope: 'ECOLE', valeurScope: ids.schoolA1, estLectureSeule: true, motif: 'Ajout perimetre certifie' });
    assert(added.status === 201, `Ajout périmètre HTTP ${added.status}: ${JSON.stringify(added.body)}`);
    const removed = await request(page, manager, 'DELETE', `/api/v1/security/affectations/${state.assignmentId}/scopes/ECOLE/${ids.schoolA1}`, { motif: 'Retrait périmètre certifié' });
    assert(removed.status === 204, `Retrait périmètre HTTP ${removed.status}`);
    return { assignmentId: state.assignmentId, added: true, removed: true };
  });
  await runScenario('SEC-029', async () => {
    const response = await request(page, manager, 'POST', `/api/v1/security/affectations/${state.assignmentId}/scopes`, { typeScope: 'ECOLE', valeurScope: ids.schoolB1, estLectureSeule: false, motif: 'Verification perimetre incoherent' });
    assert([409, 422].includes(response.status), `Le périmètre incohérent a produit HTTP ${response.status} au lieu d’un refus métier.`);
    return { status: response.status, code: response.body?.error?.code || response.body?.code };
  });
  await runScenario('SEC-030', async () => {
    state.oneSession = await devSession(page, 'OPERATEUR_SYSTEME', {}, 'session-consult-one');
    const sessions = listOf(await request(page, manager, 'GET', '/api/v1/security/sessions'));
    assert(sessions.some((item) => sessionId(item) === state.oneSession.sessionId), 'La session ouverte n’est pas visible.');
    return { sessions: sessions.length };
  });
  await runScenario('SEC-031', async () => {
    const response = await request(page, manager, 'DELETE', `/api/v1/security/sessions/${state.oneSession.sessionId}`, { motif: 'Révocation unitaire certifiée' });
    assert(response.status === 204, `Révocation session HTTP ${response.status}`);
    const sessions = listOf(await request(page, manager, 'GET', '/api/v1/security/sessions'));
    const revokedSession = sessions.find((item) => sessionId(item) === state.oneSession.sessionId);
    assert(revokedSession && sessionState(revokedSession) === 'REVOQUEE', 'La session reste active après révocation.');
    return { sessionId: state.oneSession.sessionId, revoked: true };
  });
  await runScenario('SEC-032', async () => {
    const first = await devSession(page, 'OPERATEUR_SYSTEME', {}, 'session-all-one');
    await devSession(page, 'OPERATEUR_SYSTEME', {}, 'session-all-two');
    const response = await request(page, manager, 'DELETE', `/api/v1/security/accounts/${first.userId}/sessions`, { motif: 'Révocation globale certifiée' });
    assert(response.status === 204, `Révocation globale HTTP ${response.status}`);
    const sessions = listOf(await request(page, manager, 'GET', `/api/v1/security/sessions?utilisateurId=${encodeURIComponent(first.userId)}`));
    const activeSessions = sessions.filter((item) => sessionState(item) === 'ACTIVE');
    assert(activeSessions.length === 0, `${activeSessions.length} session(s) active(s) subsistent.`);
    return { userId: first.userId, activeRemaining: 0, historicalSessions: sessions.length };
  });
  await runScenario('SEC-033', async () => {
    const attempts = listOf(await request(page, manager, 'GET', `/api/v1/security/login-attempts?recherche=${encodeURIComponent(email('locked'))}&limite=20`));
    assert(attempts.length >= 5, `${attempts.length} tentative(s) trouvée(s) au lieu de 5.`);
    await openTab(page, 'attempts');
    return { attempts: attempts.length, visibleTab: true };
  });
  await runScenario('SEC-034', async () => {
    assert(state.lockProof?.lockedAt, 'La preuve de verrouillage du scénario 8 est absente.');
    const attempts = listOf(await request(page, manager, 'GET', `/api/v1/security/login-attempts?recherche=${encodeURIComponent(email('locked'))}&limite=20`));
    assert(attempts.length >= 5, 'Les cinq échecs ayant provoqué le verrouillage ne sont pas relus.');
    return { ...state.lockProof, failedAttempts: attempts.length };
  });
  await runScenario('SEC-036', async () => {
    const response = await request(page, state.orgAuth, 'POST', `/api/v1/security/organizations/${ids.orgB}/schools/${ids.schoolB1}/administrators`, { idUtilisateur: accountId(state.main), motif: 'Tentative hors organisation' }, { organisationId: ids.orgA });
    assert(response.status === 403, `Isolation multi-tenant HTTP ${response.status} au lieu de 403.`);
    return { actorOrganisation: ids.orgA, targetOrganisation: ids.orgB, status: response.status };
  });
  await runScenario('SEC-037', async () => {
    const screenshots = path.join(artifactDir, 'responsive'); fs.mkdirSync(screenshots, { recursive: true });
    report.responsiveMatrix = [];
    for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.waitForFunction((expectedWidth) => window.innerWidth === expectedWidth, width);
      await page.waitForTimeout(100);
      for (const tab of tabs) {
        await openTab(page, tab);
        const measure = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
        const entry = { width, tab, overflow: measure.scroll > measure.client + 2, ...measure };
        report.responsiveMatrix.push(entry);
        assert(!entry.overflow, `Débordement horizontal ${width}px / ${tab}: ${measure.scroll}/${measure.client}`);
      }
      await page.screenshot({ path: path.join(screenshots, `${width}.png`), fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    return { checks: report.responsiveMatrix.length, widths: 7, tabs: 8 };
  });
  report.restartEvidence = { expectedAuditMarker: state.auditMarker, mainCompletedAt: new Date().toISOString() };
  save();
}

async function runRestart(page, manager) {
  await runScenario('SEC-035', async () => {
    const audit = listOf(await request(page, manager, 'GET', '/api/v1/security/audit/logs'));
    assert(audit.length > 0, 'L’audit est vide après redémarrage du backend.');
    const marker = report.restartEvidence?.expectedAuditMarker;
    const found = !marker || audit.some((entry) => Object.values(entry).includes(marker));
    assert(found, `Le marqueur d’audit ${marker} n’a pas été relu après redémarrage.`);
    await openTab(page, 'audit');
    return { eventsAfterRestart: audit.length, marker, persisted: true };
  });
}

async function main() {
  fs.mkdirSync(artifactDir, { recursive: true });
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'fr-FR' });
    const page = await context.newPage(); page.setDefaultTimeout(120000);
    const manager = await initializeManager(page);
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const entry = { phase, text: message.text(), location: message.location() };
      const url = entry.location?.url || '';
      const attendu = [
        ['401', '/api/auth/login'],
        ['409', '/api/v1/security/affectations/'],
        ['409', '/administrators'],
        ['400', '/api/v1/security/emergency/'],
        ['422', '/scopes'],
        ['403', '/administrators'],
      ].some(([statut, chemin]) => entry.text.includes(`status of ${statut}`) && url.includes(chemin));
      (attendu ? report.telemetry.expectedHttpRejections : report.telemetry.consoleErrors).push(entry);
    });
    page.on('requestfailed', (value) => report.telemetry.requestFailures.push({ phase, url: value.url(), method: value.method(), reason: value.failure()?.errorText }));
    if (phase === 'main') await runMain(page, manager);
    else if (phase === 'restart') await runRestart(page, manager);
    else throw new Error(`Phase inconnue: ${phase}`);
    await context.close();
  } finally {
    if (browser) await browser.close();
    report.scenarios.sort((a, b) => a.id.localeCompare(b.id));
    const passed = report.scenarios.filter((item) => item.status === 'passed').length;
    const failed = report.scenarios.filter((item) => item.status === 'failed').length;
    report.finishedAt = phase === 'restart' ? new Date().toISOString() : null;
    report.summary = {
      expected: 37, executed: report.scenarios.length, passed, failed,
      responsiveChecks: report.responsiveMatrix.length,
      consoleErrors: report.telemetry.consoleErrors.length,
      expectedHttpRejections: report.telemetry.expectedHttpRejections.length,
      requestFailures: report.telemetry.requestFailures.length,
      certified: report.scenarios.length === 37 && passed === 37 && failed === 0
        && report.responsiveMatrix.length === 56 && report.telemetry.consoleErrors.length === 0
        && report.telemetry.requestFailures.length === 0,
    };
    save();
  }
  if (phase === 'restart' && !report.summary.certified) throw new Error(`Certification incomplète: ${JSON.stringify(report.summary)}`);
}

main().catch((error) => {
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, `browser-${phase}-fatal.log`), `${error.stack || error}\n`, 'utf8');
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
