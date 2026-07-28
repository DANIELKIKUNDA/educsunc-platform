const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

function loadCoordinator() {
  const filePath = path.resolve(
    __dirname,
    '../src/shared/lifecycle/frontend-lifecycle.coordinator.ts',
  );
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filePath,
  });
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
    AbortController,
  });
  new vm.Script(transpiled.outputText, { filename: filePath }).runInContext(context);
  return module.exports.FrontendLifecycleCoordinator;
}

const FrontendLifecycleCoordinator = loadCoordinator();

function snapshot(overrides = {}) {
  return {
    authenticated: true,
    sessionId: 'session-1',
    userId: 'user-1',
    actorCode: 'MANAGER_SYSTEME',
    permissionsSignature: 'configuration.read\u001fconfiguration.write',
    governanceLevel: 'PLATEFORME',
    organizationId: '',
    schoolId: '',
    schoolYearId: '',
    ...overrides,
  };
}

test('la revision est monotone et annule les requetes precedentes', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const request = coordinator.createRequestScope();

  assert.equal(coordinator.update(snapshot()), null);
  assert.equal(coordinator.revision, 0);
  assert.equal(
    coordinator.update(snapshot({ organizationId: 'org-1' })),
    'organization',
  );
  assert.equal(coordinator.revision, 1);
  assert.equal(request.signal.aborted, true);
  assert.equal(request.isCurrent(), false);
  request.release();
});

test('un AbortController local annule uniquement la requete concernee', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const controller = new AbortController();
  const request = coordinator.createRequestScope(controller.signal);

  controller.abort();

  assert.equal(request.signal.aborted, true);
  assert.equal(request.isCurrent(), false);
  assert.equal(coordinator.revision, 0);
  request.release();
});

test('la matrice invalide les stores selon leur portee', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const resets = {
    platform: 0,
    organization: 0,
    school: 0,
    'school-year': 0,
    user: 0,
    context: 0,
  };
  for (const scope of Object.keys(resets)) {
    coordinator.registerStore({
      id: scope,
      scope,
      reset: () => {
        resets[scope] += 1;
      },
    });
  }

  coordinator.update(snapshot({ organizationId: 'org-1' }));

  assert.deepEqual(resets, {
    platform: 0,
    organization: 1,
    school: 1,
    'school-year': 1,
    user: 0,
    context: 1,
  });
});

test('un changement d acteur invalide toutes les portees', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const resetScopes = [];
  for (const scope of [
    'platform',
    'organization',
    'school',
    'school-year',
    'user',
    'context',
  ]) {
    coordinator.registerStore({
      id: scope,
      scope,
      reset: () => resetScopes.push(scope),
    });
  }

  coordinator.update(snapshot({ actorCode: 'SUPPORT_SYSTEME' }));

  assert.deepEqual(
    [...resetScopes].sort(),
    ['platform', 'organization', 'school', 'school-year', 'user', 'context'].sort(),
  );
});

test('un retrait de permission purge tous les stores et annule les requetes', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const request = coordinator.createRequestScope();
  const resetScopes = [];
  for (const scope of [
    'platform',
    'organization',
    'school',
    'school-year',
    'user',
    'context',
  ]) {
    coordinator.registerStore({
      id: `permission-${scope}`,
      scope,
      reset: () => resetScopes.push(scope),
    });
  }

  assert.equal(
    coordinator.update(snapshot({ permissionsSignature: 'configuration.read' })),
    'permissions',
  );
  assert.equal(request.signal.aborted, true);
  assert.deepEqual(
    [...resetScopes].sort(),
    ['platform', 'organization', 'school', 'school-year', 'user', 'context'].sort(),
  );
});

test("l'empreinte d'autorisation couvre scopes, modules, restrictions et titulariats", () => {
  const source = fs.readFileSync(
    path.resolve(
      __dirname,
      '../src/shared/lifecycle/frontend-lifecycle.runtime.ts',
    ),
    'utf8',
  );

  for (const marker of [
    'permissionsEffectives',
    'profile.scopes',
    'profile.restrictions',
    'profile.modulesEffectifs',
    'profile.titulariats.effectifs',
    'profile.compte.actif',
    'profile.session.actif',
  ]) {
    assert.equal(source.includes(marker), true, `${marker} doit participer a l empreinte.`);
  }
});

test('la deconnexion purge toutes les portees utilisateur et tenant', () => {
  const coordinator = new FrontendLifecycleCoordinator(snapshot());
  const resetScopes = [];
  for (const scope of [
    'platform',
    'organization',
    'school',
    'school-year',
    'user',
    'context',
  ]) {
    coordinator.registerStore({
      id: `logout-${scope}`,
      scope,
      reset: () => resetScopes.push(scope),
    });
  }

  assert.equal(
    coordinator.update(snapshot({
      authenticated: false,
      sessionId: '',
      userId: '',
      actorCode: '',
      permissionsSignature: '',
    })),
    'identity',
  );
  assert.deepEqual(
    [...resetScopes].sort(),
    ['platform', 'organization', 'school', 'school-year', 'user', 'context'].sort(),
  );
});

test('le client API distingue annulation et panne reseau', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/services/api.ts'),
    'utf8',
  );

  assert.equal(source.includes("'REQUEST_CANCELLED'"), true);
  assert.equal(source.includes("'NETWORK_ERROR'"), true);
  assert.equal(source.includes('signal: requestScope.signal'), true);
  assert.equal(source.includes('verifierRequeteCourante(requestScope)'), true);
});

test('tous les stores de domaine portent une strategie de reinitialisation', () => {
  const storesRoot = path.resolve(__dirname, '../src/domains');
  const storeFiles = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.name.endsWith('.store.ts')) {
        storeFiles.push(entryPath);
      }
    }
  };
  visit(storesRoot);

  const missingReset = storeFiles.filter(
    (filePath) => !fs.readFileSync(filePath, 'utf8').includes('reinitialiser'),
  );
  assert.equal(storeFiles.length > 0, true);
  assert.deepEqual(missingReset, []);
});

test("le store Organisation est purge lors d'un changement d'organisation", () => {
  const source = fs.readFileSync(
    path.resolve(
      __dirname,
      '../src/shared/lifecycle/domain-store-lifecycle.registry.ts',
    ),
    'utf8',
  );

  assert.equal(
    source.includes("path.endsWith('/organization-governance.store.ts')"),
    true,
  );
  assert.match(
    source,
    /organization-audit\.store\.ts'[\s\S]*organization-governance\.store\.ts'[\s\S]*return 'organization'/,
  );
});

test('le contexte actif ne lit plus de tenant depuis une variable de demonstration', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/shared/session/api-context.ts'),
    'utf8',
  );

  assert.equal(source.includes('VITE_REFERENTIEL_ORGANISATION_ID'), false);
  assert.equal(source.includes('VITE_REFERENTIEL_ECOLE_ID'), false);
  assert.equal(source.includes('VITE_REFERENTIEL_UTILISATEUR_ID'), false);
});

test('un changement de tenant ferme les capacites avant tout appel serveur', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/shared/auth/session.bootstrap.ts'),
    'utf8',
  );

  for (const functionName of [
    'activerContextePlateformeFrontend',
    'changerOrganisationActiveFrontend',
    'changerEcoleActiveFrontend',
  ]) {
    const start = source.indexOf(`function ${functionName}`);
    assert.notEqual(start, -1);
    const nextFunction = source.indexOf('\nexport async function ', start + 1);
    const body = source.slice(start, nextFunction === -1 ? undefined : nextFunction);
    assert.ok(
      body.indexOf('sessionStore.invalidateEffectiveProfile()')
      < body.indexOf('await authApi.'),
      `${functionName} doit fermer les capacites avant la requete de changement.`,
    );
  }
});

test("une cible de changement de contexte n'est jamais envoyee comme contexte deja actif", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/shared/auth/auth.api.ts'),
    'utf8',
  );

  for (const functionName of [
    'changerOrganisationActive',
    'changerEcoleActive',
  ]) {
    const start = source.indexOf(`async ${functionName}`);
    assert.notEqual(start, -1);
    const nextFunction = source.indexOf('\n  async ', start + 1);
    const body = source.slice(start, nextFunction === -1 ? undefined : nextFunction);
    assert.match(body, /entetes: construireEntetesSession\(params\)/);
    assert.doesNotMatch(body, /entetes: construireEntetesAuth\(params\)/);
  }
});

test('un acteur inconnu ne peut pas retomber sur le premier profil plateforme', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/shared/auth/session.store.ts'),
    'utf8',
  );

  assert.equal(source.includes('?? actorProfiles[0]'), false);
  assert.equal(source.includes("profile.code === 'ADMINISTRATEUR_ECOLE'"), true);
});
