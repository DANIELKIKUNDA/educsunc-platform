const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const vm = require('node:vm');

const frontendRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(frontendRoot, 'src/domains/audit');

function read(relativePath) {
  return fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');
}

function loadMapper() {
  const filePath = path.join(sourceRoot, 'mappers/platform-audit.mapper.ts');
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filePath,
  });
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports, require, Intl, Date, Object, Array });
  new vm.Script(transpiled.outputText, { filename: filePath }).runInContext(context);
  return module.exports;
}

const { mapAuditEvent, unwrapAuditEnvelope } = loadMapper();

test('L6 mappe le contrat Audit canonique sans exposer un objet brut', () => {
  const event = mapAuditEvent({
    idAuditEntry: 'audit-1',
    action: 'PAIEMENT_CREE',
    typePrincipal: 'FINANCIER',
    typeAuditPrincipal: 'FINANCIER',
    categories: ['FINANCIER', 'METIER'],
    gravite: 'ELEVEE',
    resultat: 'SUCCESS',
    acteur: { idUtilisateur: 'da****el', typeActeur: 'UTILISATEUR', roleActif: 'CAISSIER' },
    ressource: { typeRessource: 'PAIEMENT', idRessource: 'paiement-1', libelle: 'Paiement scolaire' },
    tenant: { organisationId: 'org-1', ecoleId: 'ecole-1', scope: 'ECOLE' },
    contexte: { requestId: 'req-1', correlationId: 'corr-1', sourceAudit: 'ONLINE', modeOffline: false },
    metadata: { montant: 50000, valide: true, secretToken: undefined },
    createdAt: '2026-08-13T08:00:00.000Z',
    dateAction: '2026-08-13T08:00:00.000Z',
  });

  assert.equal(event.id, 'audit-1');
  assert.equal(event.actionLabel, 'Paiement créé');
  assert.equal(event.severityLabel, 'Élevée');
  assert.equal(event.resultLabel, 'Réussi');
  assert.equal(event.metadata.some((field) => field.key === 'montant' && field.value.includes('50')), true);
  assert.equal(event.metadata.some((field) => field.key.toLowerCase().includes('token')), false);
  assert.equal(Object.prototype.hasOwnProperty.call(event, 'raw'), false);
});

test('L6 relit strictement l enveloppe HTTP officielle', () => {
  const result = unwrapAuditEnvelope({
    donnee: { success: true, data: { total: 0, items: [], pagination: { page: 1, taille: 25, total: 0, totalPages: 0, hasNextPage: false } } },
    meta: { requestId: 'req-1', durationMs: 7 },
  });
  assert.equal(result.data.total, 0);
  assert.equal(result.meta.requestId, 'req-1');
});

test('L6 relit aussi les operations L5 sans enveloppe imbriquee', () => {
  const result = unwrapAuditEnvelope({
    donnee: {
      replayId: 'replay-1',
      cible: 'PROJECTIONS',
      mode: 'DRY_RUN',
      statut: 'VALIDATED',
      evenementsCompatibles: 0,
    },
    meta: { requestId: 'req-l5', durationMs: 9 },
  });
  assert.equal(result.data.replayId, 'replay-1');
  assert.equal(result.data.statut, 'VALIDATED');
  assert.equal(result.meta.requestId, 'req-l5');
});

test('L6 utilise les routes L3 et L5 et traite le curseur comme opaque', () => {
  const api = read('src/domains/audit/services/platform-audit.api.ts');
  for (const route of [
    '/api/v1/audit', '/api/v1/audit/timeline', '/api/v1/audit/history',
    '/api/v1/exports/audit', '/api/v1/exports/forensic', '/api/v1/replay/',
    '/api/v1/retention/status', '/api/v1/retention/archive',
    '/api/v1/security/integrity/verify',
  ]) assert.equal(api.includes(route), true, `${route} doit etre branchee.`);
  assert.match(api, /cursor: filters\.cursor/);
  assert.doesNotMatch(api, /atob\(|btoa\(|JSON\.parse\(filters\.cursor/);
  assert.match(api, /inclureOrganisationActive: false/);
  assert.match(api, /inclureEcoleActive: false/);
});

test('L6 protège chaque action avancée avec la permission backend exacte', () => {
  const access = read('src/shared/permissions/access-policy.ts');
  const expected = [
    'audit.export', 'audit.export.read', 'audit.export.download', 'audit.export.delete',
    'forensic.export', 'audit.replay', 'audit.retention.read',
    'audit.retention.archive', 'audit.retention.purge', 'audit.security.read',
  ];
  for (const permission of expected) assert.equal(access.includes(`'${permission}'`), true, permission);
});

test('L6 supprime la console JSON et la pagination locale de la vue plateforme', () => {
  const view = read('src/domains/audit/views/AuditPlatformView.vue');
  const components = [
    'src/domains/audit/components/PlatformAuditJournal.vue',
    'src/domains/audit/components/PlatformAuditEventDetail.vue',
    'src/domains/audit/components/PlatformAuditOperations.vue',
  ].map(read).join('\n');
  assert.doesNotMatch(view, /JSON\.stringify|<pre>|serializeAuditTableRows|new Blob/);
  assert.doesNotMatch(components, /JSON\.stringify|<pre>|v-html/);
  assert.match(components, /Charger la suite/);
  assert.match(components, /Aucun événement trouvé/);
  assert.match(view, /Connexion requise/);
  assert.match(view, /Accès non autorisé/);
});

test('L6 conserve MVVM et des composants dédiés', () => {
  const view = read('src/domains/audit/views/AuditPlatformView.vue');
  assert.match(view, /usePlatformAuditCenterViewModel/);
  assert.doesNotMatch(view, /clientApi|platformAuditApi/);
  for (const component of [
    'PlatformAuditCockpit.vue', 'PlatformAuditFilters.vue', 'PlatformAuditJournal.vue',
    'PlatformAuditEventDetail.vue', 'PlatformAuditOperations.vue',
    'PlatformAuditTabsContent.vue', 'PlatformAuditActionModals.vue', 'PlatformAuditModalHeader.vue',
  ]) assert.equal(fs.existsSync(path.join(sourceRoot, 'components', component)), true, component);
});

test('L6 isole explicitement la session developpeur dans le serveur Playwright', () => {
  for (const configPath of [
    'e2e/audit/playwright.audit.config.ts',
    'e2e/g1/playwright.g1.config.ts',
  ]) {
    const config = read(configPath);
    assert.match(config, /APP_ENV:\s*'development'/, configPath);
    assert.match(config, /NODE_ENV:\s*'development'/, configPath);
  }
});
