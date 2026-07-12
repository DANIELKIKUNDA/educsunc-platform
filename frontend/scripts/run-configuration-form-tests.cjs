const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

function createTsModuleLoader() {
  const cache = new Map();

  function loadModule(filePath) {
    const absoluteFilePath = path.resolve(filePath);
    if (cache.has(absoluteFilePath)) {
      return cache.get(absoluteFilePath).exports;
    }

    const source = fs.readFileSync(absoluteFilePath, 'utf8');
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
      fileName: absoluteFilePath,
    });

    const module = { exports: {} };
    cache.set(absoluteFilePath, module);

    function localRequire(request) {
      if (request.startsWith('.')) {
        const candidate = path.resolve(path.dirname(absoluteFilePath), request);
        const withExtension = path.extname(candidate) ? candidate : `${candidate}.ts`;
        return loadModule(withExtension);
      }

      return require(request);
    }

    const context = vm.createContext({
      module,
      exports: module.exports,
      require: localRequire,
      __dirname: path.dirname(absoluteFilePath),
      __filename: absoluteFilePath,
      console,
      process,
    });

    new vm.Script(transpiled.outputText, { filename: absoluteFilePath }).runInContext(context);
    return module.exports;
  }

  return {
    load(relativePath) {
      return loadModule(path.resolve(__dirname, '..', relativePath));
    },
  };
}

const tsLoader = createTsModuleLoader();
const logic = tsLoader.load('src/domains/configuration/viewmodels/configuration-form.logic.ts');
const registry = tsLoader.load('src/domains/configuration/forms/configuration-field-registry.ts');
const backendKeys = tsLoader.load('../backend/src/shared/configuration/domain/constants/ConfigurationKeys.ts');

test('la liste officielle des cles couvertes reste stable', () => {
  assert.deepEqual([...registry.listCoveredConfigurationFieldKeys()], [
    'runtime.retry.maxAttempts',
    'runtime.replay.enabled',
    'runtime.cache.ttlSeconds',
    'preferences.theme',
    'branding.logo.primary',
    'branding.colors.primary',
    'branding.colors.secondary',
    'branding.footer',
    'branding.palette',
    'notifications.quotas.sms',
    'notifications.templates.default',
    'policies.branding.sigle',
    'policies.notifications.digest',
    'school.theme',
    'modules.allowed',
    'modules.enabled',
  ]);
});

test('le registre frontend couvre tout le noyau officiel des cles backend', () => {
  const covered = new Set(registry.listCoveredConfigurationFieldKeys());
  const missing = Array.from(backendKeys.CLES_CONFIGURATION).filter((key) => !covered.has(key));
  assert.equal(missing.length, 0);
});

test('le registre frontend couvre aussi les cles prouvees par integration hors noyau constant', () => {
  const covered = new Set(registry.listCoveredConfigurationFieldKeys());
  const provenIntegrationKeys = ['branding.palette'];
  const missing = provenIntegrationKeys.filter((key) => !covered.has(key));
  assert.equal(missing.length, 0);
});



test('les prefixes editoriaux du branding utilisent des controles coherents', () => {
  const signataire = logic.getConfigurationFieldDefinition('branding.signataires.caissier', 'Texte court', 'Caissier');
  const header = logic.getConfigurationFieldDefinition('branding.header.messageAccueil', 'Texte long', 'Message accueil');
  const communication = logic.getConfigurationFieldDefinition('branding.communication.signature', 'Texte long', 'Signature de communication');
  const slogan = logic.getConfigurationFieldDefinition('branding.slogan', 'Texte court', 'Slogan');

  assert.equal(signataire.control, 'text');
  assert.equal(signataire.covered, true);
  assert.equal(header.control, 'textarea');
  assert.equal(communication.control, 'textarea');
  assert.equal(slogan.control, 'text');
});


test('les preferences utilisateur reconnues par politique gardent un rendu adapte au type annonce', () => {
  const personalPreference = logic.getConfigurationFieldDefinition('user.preferences.language', 'Texte court', 'Langue');
  const notificationPreference = logic.getConfigurationFieldDefinition('notifications.preferences.digest', 'Oui / Non', 'Recevoir le digest');

  assert.equal(personalPreference.control, 'text');
  assert.equal(personalPreference.covered, true);
  assert.equal(notificationPreference.control, 'boolean-toggle');
  assert.equal(notificationPreference.covered, true);
});

test('les cles de branding et notifications reconnues utilisent des controles adaptes', () => {
  const primaryColor = logic.getConfigurationFieldDefinition('branding.colors.primary', 'Couleur', 'Couleur principale');
  const smsQuota = logic.getConfigurationFieldDefinition('notifications.quotas.sms', 'Nombre', 'Quota SMS');
  const defaultTemplate = logic.getConfigurationFieldDefinition('notifications.templates.default', 'Texte long', 'Message par defaut');

  assert.equal(primaryColor.control, 'color');
  assert.equal(smsQuota.control, 'integer-stepper');
  assert.equal(defaultTemplate.control, 'textarea');
});

test('une couleur hexadecimale valide active l enregistrement', () => {
  const definition = logic.getConfigurationFieldDefinition('branding.colors.primary', 'Couleur', 'Couleur principale');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '#1d4ed8',
    initialValue: '#0f172a',
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, true);
  assert.equal(result.normalizedValue, '#1d4ed8');
});

test('une couleur invalide bloque la validation avec un message metier', () => {
  const definition = logic.getConfigurationFieldDefinition('branding.colors.primary', 'Couleur', 'Couleur principale');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: 'bleu',
    initialValue: '#0f172a',
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, false);
  assert.equal(result.validationError, 'Saisissez une couleur hexadecimale valide, par exemple #1d4ed8.');
});

test('une saisie numerique valide active l enregistrement', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.retry.maxAttempts', 'Nombre', 'Tentatives de reprise');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '13',
    initialValue: 12,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, true);
  assert.equal(result.normalizedValue, 13);
  assert.equal(result.disableReason, null);
});

test('une saisie numerique invalide laisse l enregistrement desactive', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.cache.ttlSeconds', 'Nombre de secondes', 'Duree');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '12.5|minutes',
    initialValue: 600,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, false);
  assert.equal(result.validationError, 'Saisissez une duree entiere.');
});

test('une valeur identique reste enregistrable pour permettre une resoumission explicite', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.retry.maxAttempts', 'Nombre', 'Tentatives de reprise');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '13',
    initialValue: 13,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, true);
  assert.equal(result.disableReason, null);
  assert.equal(result.isDirty, false);
});

test('une modification booleenne valide active l enregistrement', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.replay.enabled', 'Oui / Non', 'Relance automatique');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: 'false',
    initialValue: true,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, true);
  assert.equal(result.normalizedValue, false);
});

test('le theme utilisateur devient un choix guide plutot qu une saisie libre', () => {
  const definition = logic.getConfigurationFieldDefinition('preferences.theme', 'Texte court', "Theme de l'espace personnel");
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: 'dark',
    initialValue: 'light',
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(definition.control, 'radio-group');
  assert.equal(result.canSubmit, true);
  assert.equal(result.normalizedValue, 'dark');
});

test('la duree de conservation convertit proprement les minutes en secondes backend', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.cache.ttlSeconds', 'Nombre de secondes', 'Duree');
  const formatted = logic.formatConfigurationValueForForm(900, definition);
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: formatted,
    initialValue: 900,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(formatted, '15|minutes');
  assert.equal(result.normalizedValue, 900);
  assert.equal(result.canSubmit, true);
});

test('la lecture seule desactive l enregistrement avec raison claire', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.retry.maxAttempts', 'Nombre', 'Tentatives de reprise');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '15',
    initialValue: 12,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: false,
    locked: false,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, "Vous disposez d'un acces en lecture seule.");
});

test('un reglage verrouille desactive l enregistrement', () => {
  const definition = logic.getConfigurationFieldDefinition('runtime.retry.maxAttempts', 'Nombre', 'Tentatives de reprise');
  const result = logic.evaluateConfigurationForm({
    action: 'edit',
    rawValue: '15',
    initialValue: 12,
    fieldDefinition: definition,
    isLoaded: true,
    canMutate: true,
    locked: true,
    isSubmitting: false,
    conflictDetected: false,
  });

  assert.equal(result.canSubmit, false);
  assert.equal(result.disableReason, 'Ce reglage est verrouille.');
});

test('un brouillon local reste prioritaire pendant un rechargement non destructif', () => {
  assert.equal(logic.shouldKeepLocalDraft(true, true), true);
  assert.equal(logic.shouldKeepLocalDraft(true, false), false);
  assert.equal(logic.shouldKeepLocalDraft(false, true), false);
});

test('une fermeture avec brouillon demande confirmation', () => {
  assert.equal(logic.resolveCloseBehavior('cancel', true, false), 'confirm');
  assert.equal(logic.resolveCloseBehavior('escape', true, false), 'confirm');
  assert.equal(logic.resolveCloseBehavior('backdrop', true, false), 'confirm');
});

test('une fermeture pendant enregistrement est ignoree', () => {
  assert.equal(logic.resolveCloseBehavior('cancel', true, true), 'ignore');
});

test('une fermeture sans brouillon ferme directement la modale', () => {
  assert.equal(logic.resolveCloseBehavior('button', false, false), 'close');
});
