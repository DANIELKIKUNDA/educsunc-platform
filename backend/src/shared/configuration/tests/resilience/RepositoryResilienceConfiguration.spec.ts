import assert from 'node:assert/strict';
import test from 'node:test';
import { RepositoryConfigurationMemoire, ConfigurationId } from 'shared/configuration';

test('le repository memoire retourne null sur une configuration absente', async () => {
  const repository = new RepositoryConfigurationMemoire();
  const resultat = await repository.trouverParId(ConfigurationId.creer('inexistante'));

  assert.equal(resultat, null);
});
