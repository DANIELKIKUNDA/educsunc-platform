import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresSessionUtilisateurRepository } from 'shared/auth/infrastructure/persistence/postgres/repositories/PostgresSessionUtilisateurRepository';
import { creerSessionUtilisateur, reinitialiserMemoireAuth } from '../support/AuthTestSupport';

test('save session, find active session, revoke session, find offline session', async () => {
  reinitialiserMemoireAuth();
  const repository = new PostgresSessionUtilisateurRepository();
  const session = creerSessionUtilisateur({ estOffline: true });
  await repository.sauvegarder(session);

  const active = await repository.trouverSessionActive(session.obtenirId());
  assert.ok(active);
  assert.equal(active?.obtenirEstOffline(), true);

  await repository.revoquerSessionsUtilisateur(session.obtenirIdUtilisateur(), 'test');
  assert.equal(await repository.trouverSessionActive(session.obtenirId()), null);
});
