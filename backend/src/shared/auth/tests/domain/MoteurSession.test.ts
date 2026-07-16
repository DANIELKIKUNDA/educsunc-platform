import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurSession } from 'shared/auth/domain';
import { creerSessionUtilisateur } from '../support/AuthTestSupport';

test('creation session', () => {
  const moteur = new MoteurSession();
  const session = moteur.ouvrirSession({ idUtilisateur: 'utilisateur-1', refreshTokenId: 'refresh-1' });
  assert.equal(session.obtenirIdUtilisateur(), 'utilisateur-1');
});

test('revocation session', () => {
  const moteur = new MoteurSession();
  const session = creerSessionUtilisateur();
  moteur.revoquerSession(session, 'logout');
  assert.ok(session.obtenirRevoqueeLe() instanceof Date);
});

test('session persistante sans expiration temporelle', () => {
  const moteur = new MoteurSession();
  const session = creerSessionUtilisateur();
  assert.doesNotThrow(() => moteur.verifierSession(session));
});

test('restauration session offline', () => {
  const moteur = new MoteurSession();
  const session = creerSessionUtilisateur();
  moteur.restaurerModeOffline(session);
  assert.equal(session.obtenirEstOffline(), true);
});
