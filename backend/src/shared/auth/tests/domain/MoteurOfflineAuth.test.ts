import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurSynchronisationAuth, MoteurOfflineAuth } from 'shared/auth/domain';
import { creerContexteActifAuth, creerSessionUtilisateur, creerUtilisateurAuth } from '../support/AuthTestSupport';

test('auth offline et reprise connexion', () => {
  const moteur = new MoteurOfflineAuth();
  const utilisateur = creerUtilisateurAuth({ authOfflineAutorisee: true });
  const session = creerSessionUtilisateur();

  moteur.activerSessionOffline(session, utilisateur);

  assert.equal(session.obtenirEstOffline(), true);
});

test('synchronisation offline preparee', () => {
  const moteur = new MoteurOfflineAuth();
  const utilisateur = creerUtilisateurAuth({ authOfflineAutorisee: true });
  const session = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId(), estOffline: true });
  const contexte = creerContexteActifAuth(utilisateur.obtenirId(), 'org-1', 'ecole-1');

  const synchronisation = moteur.preparerSynchronisation(session, contexte);

  assert.equal(synchronisation.estOffline, true);
  assert.equal(synchronisation.organisationActiveId, 'org-1');
});

test('synchronisation offline refusee pour une session non offline', () => {
  const moteur = new MoteurOfflineAuth();
  const session = creerSessionUtilisateur({ estOffline: false });
  const contexte = creerContexteActifAuth('utilisateur-1');
  assert.throws(() => moteur.preparerSynchronisation(session, contexte), ErreurSynchronisationAuth);
});
