import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresContexteActifAuthRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresContexteActifAuthRepository';
import { creerContexteActifAuth, reinitialiserMemoireAuth } from '../support/AuthTestSupport';

test('save contexte actif, update ecole active et update organisation active', async () => {
  reinitialiserMemoireAuth();
  const repository = new PostgresContexteActifAuthRepository();
  const contexte = creerContexteActifAuth('user-1', 'org-1', 'ecole-1');
  await repository.sauvegarder(contexte);

  let trouve = await repository.trouverContexteUtilisateur('user-1');
  assert.equal(trouve?.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(trouve?.obtenirEcoleActiveId(), 'ecole-1');

  trouve!.changerOrganisationActive('org-2');
  await repository.sauvegarder(trouve!);
  trouve = await repository.trouverContexteUtilisateur('user-1');
  assert.equal(trouve?.obtenirOrganisationActiveId(), 'org-2');
});
