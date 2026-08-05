const test = require('node:test');
const assert = require('node:assert/strict');
const { loadTsModule } = require('./load-typescript-module.cjs');

const logic = loadTsModule('src/domains/configuration/viewmodels/configuration-form.logic.ts');
const registry = loadTsModule('src/domains/configuration/forms/configuration-field-registry.ts');

const OFFICIAL_KEYS = [
  'runtime.retry.maxAttempts', 'runtime.replay.enabled', 'runtime.cache.ttlSeconds',
  'notifications.providers.in_app.enabled', 'notifications.providers.sms.enabled',
  'notifications.providers.email.enabled', 'notifications.providers.whatsapp.enabled',
  'notifications.providers.push.enabled', 'notifications.providers.webhook.enabled',
  'notifications.retry.enabled', 'notifications.retry.maxAttempts',
  'notifications.retry.defaultBackoffMs', 'notifications.replay.enabled',
  'notifications.replay.batchSize', 'modules.allowed', 'modules.enabled',
  'preferences.theme', 'notifications.preferences.muted',
  'notifications.preferences.preferredChannel', 'notifications.preferences.enabledChannels',
];

function evaluate(key, rawValue, overrides = {}) {
  const fieldDefinition = logic.getConfigurationFieldDefinition(key, overrides.dataTypeLabel ?? 'Nombre', overrides.label ?? key);
  return logic.evaluateConfigurationForm({
    action: overrides.action ?? 'edit', rawValue, initialValue: overrides.initialValue ?? null,
    fieldDefinition, isLoaded: overrides.isLoaded ?? true, canMutate: overrides.canMutate ?? true,
    locked: overrides.locked ?? false, isSubmitting: overrides.isSubmitting ?? false,
    conflictDetected: overrides.conflictDetected ?? false,
  });
}

test('le registre couvre exactement les vingt réglages officiels', () => {
  assert.deepEqual([...registry.listCoveredConfigurationFieldKeys()].sort(), [...OFFICIAL_KEYS].sort());
});

test('les anciennes clés de présentation ne sont plus déclarées comme couvertes', () => {
  for (const key of ['branding.logo.primary', 'notifications.quotas.sms', 'policies.branding.sigle', 'school.theme']) {
    assert.equal(logic.getConfigurationFieldDefinition(key, 'Texte', key).covered, false);
  }
});

test('les limites numériques officielles sont appliquées', () => {
  assert.equal(evaluate('runtime.retry.maxAttempts', '1').canSubmit, true);
  assert.equal(evaluate('runtime.retry.maxAttempts', '11').validationError, 'La valeur maximale est 10.');
  assert.equal(evaluate('runtime.cache.ttlSeconds', '29').validationError, 'La valeur minimale est 30.');
  assert.equal(evaluate('notifications.retry.maxAttempts', '20').canSubmit, true);
  assert.equal(evaluate('notifications.replay.batchSize', '1001').validationError, 'La valeur maximale est 1000.');
});

test('un nombre décimal est refusé lorsqu’un entier est attendu', () => {
  assert.equal(evaluate('runtime.cache.ttlSeconds', '12.5').validationError, 'Saisissez un nombre entier.');
});

test('les booléens utilisent une saisie guidée', () => {
  const definition = logic.getConfigurationFieldDefinition('notifications.retry.enabled', 'Oui / Non', 'Reprise');
  assert.equal(definition.control, 'boolean-toggle');
  assert.equal(evaluate('notifications.retry.enabled', 'false', { dataTypeLabel: 'Oui / Non' }).normalizedValue, false);
});

test('le thème et le canal préféré utilisent des choix explicites', () => {
  assert.equal(logic.getConfigurationFieldDefinition('preferences.theme', 'Choix', 'Thème').control, 'radio-group');
  assert.equal(logic.getConfigurationFieldDefinition('notifications.preferences.preferredChannel', 'Choix', 'Canal').control, 'select');
});

test('les canaux multiples produisent une liste métier valide', () => {
  const result = evaluate('notifications.preferences.enabledChannels', '["IN_APP","EMAIL"]', { dataTypeLabel: 'Liste' });
  assert.equal(JSON.stringify(result.normalizedValue), JSON.stringify(['IN_APP', 'EMAIL']));
  assert.equal(result.canSubmit, true);
  assert.equal(evaluate('notifications.preferences.enabledChannels', '["INCONNU"]', { dataTypeLabel: 'Liste' }).canSubmit, false);
});

test('la lecture seule, le verrouillage et le conflit bloquent l’enregistrement', () => {
  assert.equal(evaluate('runtime.retry.maxAttempts', '4', { canMutate: false }).canSubmit, false);
  assert.equal(evaluate('runtime.retry.maxAttempts', '4', { locked: true }).canSubmit, false);
  assert.equal(evaluate('runtime.retry.maxAttempts', '4', { conflictDetected: true }).canSubmit, false);
});

test('une modification existante exige une fiche effectivement chargée', () => {
  assert.equal(evaluate('runtime.retry.maxAttempts', '4', { isLoaded: false }).canSubmit, false);
});

test('le brouillon et la fermeture restent stables', () => {
  assert.equal(logic.shouldKeepLocalDraft(true, true), true);
  assert.equal(logic.resolveCloseBehavior('cancel', true, false), 'confirm');
  assert.equal(logic.resolveCloseBehavior('escape', true, true), 'ignore');
  assert.equal(logic.resolveCloseBehavior('button', false, false), 'close');
});
