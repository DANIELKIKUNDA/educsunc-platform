import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresUtilisateurAuthRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresUtilisateurAuthRepository';
import { creerUtilisateurAuth, reinitialiserMemoireAuth } from '../support/AuthTestSupport';

test('save utilisateur, update utilisateur, recherche utilisateur et email', async () => {
  reinitialiserMemoireAuth();
  const repository = new PostgresUtilisateurAuthRepository();
  const utilisateur = creerUtilisateurAuth();
  await repository.sauvegarder(utilisateur);

  const parId = await repository.trouverParId(utilisateur.obtenirId());
  const parEmail = await repository.trouverParEmail(utilisateur.obtenirEmail().obtenirValeur());
  assert.ok(parId);
  assert.ok(parEmail);

  utilisateur.suspendreCompte();
  await repository.sauvegarder(utilisateur);
  const maj = await repository.trouverParId(utilisateur.obtenirId());
  assert.equal(maj?.obtenirEtatCompte(), 'SUSPENDED');
});
