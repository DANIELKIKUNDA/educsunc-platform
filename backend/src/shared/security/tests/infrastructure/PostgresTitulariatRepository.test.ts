import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresAffectationTitulariatRepository } from 'shared/security/infrastructure';
import { creerAffectationTitulariat, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('save titulariat, find titulariat actif et cloture titulariat', async () => {
  reinitialiserMemoireSecurity();
  const repository = new PostgresAffectationTitulariatRepository();
  const titulariat = creerAffectationTitulariat();
  await repository.sauvegarder(titulariat);

  assert.ok(await repository.trouverActifParClasse('classe-1', 'annee-1'));
  titulariat.retirer();
  await repository.sauvegarder(titulariat);
  assert.equal(await repository.trouverActifParClasse('classe-1', 'annee-1'), null);
});
