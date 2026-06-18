import assert from 'node:assert/strict';
import test from 'node:test';
import { ValidateurHttpCreateConfiguration, ValidateurHttpLockConfiguration } from 'shared/configuration';

test('les validateurs HTTP projetent correctement les params et le body', () => {
  const creation = ValidateurHttpCreateConfiguration.valider({
    key: 'runtime.retry.max',
    value: 3,
    scope: { niveau: 'SYSTEM' },
  });
  const lock = ValidateurHttpLockConfiguration.valider(
    { id: 'config-1' },
    { niveauMinimalAutorise: 'SYSTEM', actorId: 'actor-1' },
  );

  assert.equal(creation.key, 'runtime.retry.max');
  assert.equal(lock.configurationId, 'config-1');
});
