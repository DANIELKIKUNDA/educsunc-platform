import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ConfigurationKey,
  ConfigurationValue,
  EffectiveValue,
  ServiceSnapshotsConfiguration,
} from 'shared/configuration';

test('un snapshot de configuration conserve l identifiant de la configuration source', () => {
  const service = new ServiceSnapshotsConfiguration();
  const snapshot = service.creer(
    'snapshot-1',
    'configuration-42',
    [
      new EffectiveValue({
        key: ConfigurationKey.creer('runtime.cache.ttlSeconds'),
        value: ConfigurationValue.creer(120),
        sourceNiveau: 'SYSTEM',
        herite: false,
        verrouille: false,
        explanation: 'Valeur de reference plateforme',
      }),
    ],
  );

  const details = snapshot.details();

  assert.equal(details.identifiantSnapshot, 'snapshot-1');
  assert.equal(details.configurationId, 'configuration-42');
  assert.equal(details.valeurs[0]?.key.valeur(), 'runtime.cache.ttlSeconds');
  assert.equal(details.valeurs[0]?.value.valeur(), 120);
});
