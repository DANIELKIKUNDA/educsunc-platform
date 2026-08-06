const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

const moduleCache = new Map();

function resolveTypeScriptModule(parentPath, request) {
  if (!request.startsWith('.')) {
    return null;
  }
  const candidate = path.resolve(path.dirname(parentPath), request);
  for (const filePath of [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    path.join(candidate, 'index.ts'),
  ]) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }
  return null;
}

function loadTypeScriptModule(filePath) {
  const absolutePath = path.resolve(filePath);
  if (moduleCache.has(absolutePath)) {
    return moduleCache.get(absolutePath).exports;
  }

  const source = fs.readFileSync(absolutePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  });
  const module = { exports: {} };
  moduleCache.set(absolutePath, module);
  const localRequire = (request) => {
    const resolved = resolveTypeScriptModule(absolutePath, request);
    return resolved ? loadTypeScriptModule(resolved) : require(request);
  };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: localRequire,
    console,
    Set,
    Map,
    Object,
  });
  new vm.Script(transpiled.outputText, { filename: absolutePath }).runInContext(context);
  return module.exports;
}

const permissionsDirectory = path.resolve(__dirname, '../src/shared/permissions');
const {
  evaluateEffectiveAccess,
  hasDerivedCapability,
  listEffectiveActorCodes,
} = loadTypeScriptModule(path.join(permissionsDirectory, 'effective-access.engine.ts'));
const {
  normalizeEffectiveProfile,
} = loadTypeScriptModule(path.join(permissionsDirectory, 'effective-profile.ts'));
const {
  UI_ACTION_POLICIES,
  UI_MODULE_POLICIES,
} = loadTypeScriptModule(path.join(permissionsDirectory, 'access-policy.ts'));
const {
  actorProfiles,
  moduleDoctrine,
  pageDoctrine,
} = loadTypeScriptModule(
  path.resolve(__dirname, '../src/shared/doctrine/frontend-doctrine.ts'),
);

function profilePayload(overrides = {}) {
  return {
    versionContrat: 1,
    actorCodes: ['ENSEIGNANT'],
    acteurCodeActif: 'ENSEIGNANT',
    permissionsEffectives: ['bulletins.read', 'cotes.write'],
    scopes: [{
      typeScope: 'ECOLE',
      valeurScope: 'ecole-a',
      estLectureSeule: false,
    }],
    restrictions: [],
    modulesEffectifs: ['BULLETINS_EVALUATIONS'],
    compte: {
      idUtilisateur: 'enseignant-1',
      etat: 'ACTIVE',
      actif: true,
    },
    session: {
      id: 'session-1',
      etat: 'ACTIVE',
    },
    contexte: {
      governanceLevel: 'ECOLE',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
      anneeScolaireId: 'annee-1',
    },
    titulariatsEffectifs: [{
      idOrganisation: 'org-a',
      idEcole: 'ecole-a',
      idClasse: 'classe-a',
      idAnneeScolaire: 'annee-1',
      idSectionScolaire: 'section-a',
      source: 'RESPONSABILITE_CLASSE',
    }],
    estTitulaireEffectif: true,
    sourceTitulariatEffectif: 'RESPONSABILITE_CLASSE',
    ...overrides,
  };
}

function normalizedProfile(overrides = {}) {
  return normalizeEffectiveProfile(profilePayload(overrides), {
    actorCode: 'ENSEIGNANT',
    userId: 'enseignant-1',
    sessionId: 'session-1',
    governanceLevel: 'ECOLE',
  });
}

const teacherRequirement = {
  actorCodes: ['ENSEIGNANT'],
  permissionsAnyOf: ['bulletins.read'],
  commercialModule: 'BULLETINS_EVALUATIONS',
  moduleRequiredAt: ['ECOLE'],
  scope: 'CURRENT',
  derivedCapabilitiesAnyOf: ['TITULAIRE_EFFECTIF'],
};

test('normalise uniquement le profil effectif authentifie', () => {
  const profile = normalizedProfile();

  assert.equal(profile.resolved, true);
  assert.equal(profile.source, 'PROFIL_EFFECTIF');
  assert.deepEqual(Array.from(profile.actorCodes), ['ENSEIGNANT']);
  assert.deepEqual(
    Array.from(profile.permissionsEffectives),
    ['bulletins.read', 'cotes.write'],
  );
  assert.equal(profile.titulariats.effectifs.length, 1);
  assert.equal(profile.titulariats.effectifs[0].idClasse, 'classe-a');
  assert.deepEqual(Array.from(listEffectiveActorCodes(profile)), ['ENSEIGNANT']);
});

test("un acteur affecte mais non actif n'autorise jamais l'interface", () => {
  const profile = normalizedProfile({
    actorCodes: ['ENSEIGNANT', 'MANAGER_SYSTEME'],
  });

  assert.deepEqual(Array.from(listEffectiveActorCodes(profile)), ['ENSEIGNANT']);
  assert.equal(
    evaluateEffectiveAccess(profile, {
      actorCodes: ['MANAGER_SYSTEME'],
      permissionsAnyOf: ['bulletins.read'],
      scope: 'CURRENT',
    }, {
      governanceLevel: 'ECOLE',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
    }).reason,
    'ACTOR_DENIED',
  );
});

test("n'invente ni acteur ni module lorsque la projection serveur est incomplete", () => {
  const profile = normalizedProfile({
    actorCodes: [],
    acteurCodeActif: undefined,
    permissionsEffectives: ['bulletins.read'],
    modulesEffectifs: [],
  });

  assert.equal(profile.resolved, false);
  assert.deepEqual(Array.from(profile.actorCodes), []);
  assert.deepEqual(Array.from(profile.modulesEffectifs), []);
});

test('autorise la classe du titulaire et refuse une classe etrangere', () => {
  const profile = normalizedProfile();
  const target = {
    governanceLevel: 'ECOLE',
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    classeId: 'classe-a',
    anneeScolaireId: 'annee-1',
  };

  assert.equal(evaluateEffectiveAccess(profile, teacherRequirement, target).allowed, true);
  assert.equal(
    evaluateEffectiveAccess(profile, teacherRequirement, {
      ...target,
      classeId: 'classe-b',
    }).reason,
    'DERIVED_CAPABILITY_MISSING',
  );
  assert.equal(hasDerivedCapability(profile, 'TITULAIRE_EFFECTIF', target), true);
});

test('refuse permission, module, scope, restriction et portee lecture seule', () => {
  const target = {
    governanceLevel: 'ECOLE',
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    classeId: 'classe-a',
    anneeScolaireId: 'annee-1',
  };

  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({ permissionsEffectives: [] }),
      teacherRequirement,
      target,
    ).reason,
    'PERMISSION_DENIED',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({ modulesEffectifs: ['AUDIT'] }),
      teacherRequirement,
      target,
    ).reason,
    'MODULE_INACTIVE',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile(),
      { ...teacherRequirement, derivedCapabilitiesAnyOf: undefined },
      {
      ...target,
      ecoleId: 'ecole-b',
      },
    ).reason,
    'SCOPE_DENIED',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({ restrictions: ['INTERDICTION_BULLETINS'] }),
      { ...teacherRequirement, blockedByRestrictions: ['INTERDICTION_BULLETINS'] },
      target,
    ).reason,
    'RESTRICTION_APPLIED',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({
        scopes: [{
          typeScope: 'ECOLE',
          valeurScope: 'ecole-a',
          estLectureSeule: true,
        }],
      }),
      { ...teacherRequirement, mutation: true },
      target,
    ).reason,
    'READ_ONLY_SCOPE',
  );
});

test('refuse un compte suspendu et une session inactive avant toute action', () => {
  const target = {
    governanceLevel: 'ECOLE',
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
  };
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({ compte: { idUtilisateur: 'enseignant-1', etat: 'SUSPENDU' } }),
      teacherRequirement,
      target,
    ).reason,
    'ACCOUNT_INACTIVE',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({ session: { id: 'session-1', etat: 'REVOQUEE' } }),
      teacherRequirement,
      target,
    ).reason,
    'SESSION_INACTIVE',
  );
});

test("limite un parent a ses enfants autorises", () => {
  const profile = normalizedProfile({
    actorCodes: ['PARENT'],
    acteurCodeActif: 'PARENT',
    permissionsEffectives: ['paiements.read'],
    titulariatsEffectifs: [],
    estTitulaireEffectif: false,
    sourceTitulariatEffectif: 'AUCUNE',
    ownership: {
      elevesAutorises: ['eleve-autorise'],
    },
  });
  const requirement = {
    actorCodes: ['PARENT'],
    permissionsAnyOf: ['paiements.read'],
    scope: 'CURRENT',
    ownedStudent: true,
  };
  const target = {
    governanceLevel: 'ECOLE',
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
  };

  assert.equal(
    evaluateEffectiveAccess(profile, requirement, {
      ...target,
      eleveId: 'eleve-autorise',
    }).allowed,
    true,
  );
  assert.equal(
    evaluateEffectiveAccess(profile, requirement, {
      ...target,
      eleveId: 'eleve-etranger',
    }).reason,
    'OWNERSHIP_DENIED',
  );
  assert.equal(
    evaluateEffectiveAccess(
      normalizedProfile({
        actorCodes: ['PARENT'],
        acteurCodeActif: 'PARENT',
        permissionsEffectives: ['paiements.read'],
        ownership: { elevesAutorises: [] },
      }),
      requirement,
      target,
    ).reason,
    'OWNERSHIP_DENIED',
  );
});

test("les vues du titulaire bloquent tout chargement avant l'appel au store", () => {
  const vues = [
    'ClassementClasseView.vue',
    'StatistiquesPedagogiquesClasseView.vue',
    'EncodageConduiteView.vue',
  ];

  for (const nomVue of vues) {
    const source = fs.readFileSync(
      path.resolve(
        __dirname,
        '../src/domains/pedagogique/views',
        nomVue,
      ),
      'utf8',
    );

    assert.match(source, /if \(!isAuthorized\.value \|\| !canLoad\.value\)/);
    assert.match(
      source,
      /isAuthorized\.value && canLoad\.value\) \{\s+void charger/,
    );
  }
});

test("les mutations securite invalident et rechargent la projection effective", () => {
  const storeSource = fs.readFileSync(
    path.resolve(
      __dirname,
      '../src/domains/security/stores/security-center.store.ts',
    ),
    'utf8',
  );
  const bootstrapSource = fs.readFileSync(
    path.resolve(__dirname, '../src/shared/auth/session.bootstrap.ts'),
    'utf8',
  );

  assert.match(storeSource, /await notifierChangementCapacitesFrontend\(\)/);
  assert.match(
    bootstrapSource,
    /postMessage\(\{ type: 'capabilities-changed' \}\)/,
  );
  assert.match(
    bootstrapSource,
    /event\.data\?\.type === 'capabilities-changed'/,
  );
  assert.match(
    bootstrapSource,
    /sessionStore\.invalidateEffectiveProfile\(\);\s+authChannel\?\.postMessage/,
  );
});

test('toutes les actions et tous les modules documentes ont une politique effective', () => {
  const actionCodes = new Set(
    pageDoctrine.flatMap((page) => page.visibleActions.map((action) => action.code)),
  );
  const missingActions = [...actionCodes].filter((code) => !UI_ACTION_POLICIES[code]);
  const moduleCodes = new Set(moduleDoctrine.map((module) => module.code));
  const missingModules = [...moduleCodes].filter((code) => !UI_MODULE_POLICIES[code]);

  assert.deepEqual(missingActions, []);
  assert.deepEqual(missingModules, []);
});

test('TITULAIRE ne subsiste pas comme acteur statique de navigation', () => {
  assert.equal(actorProfiles.some((actor) => actor.code === 'TITULAIRE'), false);
  assert.equal(
    pageDoctrine.some((page) => page.actorCodes.includes('TITULAIRE')),
    false,
  );
});
