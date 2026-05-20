import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurSessionExpiree, ErreurSessionRevoquee } from 'shared/auth/domain';
import { creerSessionUtilisateur } from '../support/AuthTestSupport';

test('doit ouvrir une session valide avec utilisateur, contexte et metadonnees appareil', () => {
  const session = creerSessionUtilisateur({
    idUtilisateur: 'utilisateur-1',
    refreshTokenId: 'refresh-1',
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
    deviceId: 'device-1',
    userAgent: 'test-agent',
  });

  assert.equal(session.obtenirIdUtilisateur(), 'utilisateur-1');
  assert.equal(session.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(session.obtenirEcoleActiveId(), 'ecole-1');
  assert.equal(session.obtenirDeviceId(), 'device-1');
  assert.equal(session.obtenirUserAgent(), 'test-agent');
});

test('doit revoquer une session et produire un evenement SessionRevoquee', () => {
  const session = creerSessionUtilisateur();
  session.revoquer('logout');

  assert.ok(session.obtenirRevoqueeLe() instanceof Date);
  assert.equal(session.obtenirRaisonRevocation(), 'logout');
  assert.throws(() => session.verifierValidite(), ErreurSessionRevoquee);
  assert.ok(session.recupererEvenements().some((event) => event.constructor.name === 'SessionRevoquee'));
});

test('doit detecter une session expiree', () => {
  const session = creerSessionUtilisateur({ expireLe: new Date(Date.now() - 1000) });
  assert.throws(() => session.verifierValidite(), ErreurSessionExpiree);
});

test('doit supporter et marquer une session offline', () => {
  const session = creerSessionUtilisateur();
  session.activerModeOffline();

  assert.equal(session.obtenirEstOffline(), true);
  assert.ok(session.recupererEvenements().some((event) => event.constructor.name === 'SessionOfflineActivee'));
});
