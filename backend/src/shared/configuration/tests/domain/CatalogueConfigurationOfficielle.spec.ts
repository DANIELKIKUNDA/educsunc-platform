import assert from 'node:assert/strict';
import test from 'node:test';

import {
  listerConfigurationsOfficielles,
  listerConfigurationsOfficiellesParMoment,
  trouverConfigurationOfficielle,
} from '../../domain/constants/CatalogueConfigurationOfficielle';

test('le catalogue officiel expose les reglages runtime et utilisateur attendus', () => {
  const retry = trouverConfigurationOfficielle('runtime.retry.maxAttempts');
  const theme = trouverConfigurationOfficielle('preferences.theme');

  assert.ok(retry);
  assert.equal(retry?.valeurParDefaut, 3);
  assert.equal(retry?.scope, 'SYSTEM');

  assert.ok(theme);
  assert.equal(theme?.valeurParDefaut, 'system');
  assert.equal(theme?.scope, 'USER');
});

test('le catalogue officiel expose des reglages notification globaux et personnels', () => {
  const definitions = listerConfigurationsOfficielles();

  assert.ok(definitions.some((entry) => entry.key === 'notifications.retry.enabled'));
  assert.ok(definitions.some((entry) => entry.key === 'notifications.providers.email.enabled'));
  assert.ok(definitions.some((entry) => entry.key === 'notifications.preferences.enabledChannels'));
});

test('le catalogue officiel permet de lister les defaults par moment d initialisation', () => {
  const systeme = listerConfigurationsOfficiellesParMoment('BOOTSTRAP_SYSTEME');
  const utilisateur = listerConfigurationsOfficiellesParMoment('PREMIERE_UTILISATION');

  assert.ok(systeme.some((entry) => entry.key === 'runtime.cache.ttlSeconds'));
  assert.ok(utilisateur.some((entry) => entry.key === 'preferences.theme'));
});
