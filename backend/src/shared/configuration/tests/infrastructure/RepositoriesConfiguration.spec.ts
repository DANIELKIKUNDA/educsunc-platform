import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigurationId, RepositoryConfigurationMemoire } from 'shared/configuration';
import { ConfigurationFactory } from '../factories/ConfigurationFactory';

test('RepositoryConfigurationMemoire sauvegarde puis relit une configuration', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const configuration = ConfigurationFactory.creer();

  await repository.sauvegarder(configuration);
  const relue = await repository.trouverParId(ConfigurationId.creer('config-test-1'));

  assert.equal(relue?.details().identifiant, 'config-test-1');
});
