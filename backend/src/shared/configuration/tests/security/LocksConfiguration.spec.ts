import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';
import { ConfigurationKey, ConfigurationLock } from 'shared/configuration';

test('une configuration verrouillee ne doit plus accepter de modification applicative simple', () => {
  const configuration = ConfigurationFactory.creer();
  configuration.verrouiller(new ConfigurationLock({
    key: ConfigurationKey.creer('runtime.retry.max'),
    niveauMinimalAutorise: 'SYSTEM',
    actorId: 'actor-1',
    verrouilleLe: new Date(),
  }));

  assert.equal(configuration.details().statut, 'LOCKED');
});
