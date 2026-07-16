import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurCompteDesactive, ErreurCompteSuspendu, ErreurMotDePasseInvalide, MoteurAuthentification } from 'shared/auth/domain';
import { creerUtilisateurAuth } from '../support/AuthTestSupport';

function creerMoteurAuthentification() {
  return new MoteurAuthentification({
    verifierMotDePasse: (clair, hash) => clair === 'secret' && hash === 'hash-correct',
    genererJwt: (payload) => `jwt:${String(payload.sub)}`,
    genererRefreshTokenValue: () => 'refresh-brut',
    hacherRefreshToken: (valeur) => `hash:${valeur}`,
  });
}

test('login reussi', () => {
  const moteur = creerMoteurAuthentification();
  const utilisateur = creerUtilisateurAuth();

  const resultat = moteur.authentifier({
    utilisateur,
    motDePasseClair: 'secret',
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });

  assert.equal(resultat.jwtToken.obtenirValeur(), `jwt:${utilisateur.obtenirId()}`);
  assert.equal(resultat.refreshTokenValue.obtenirValeur(), 'refresh-brut');
  assert.equal(resultat.sessionUtilisateur.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(resultat.tentativeConnexion.obtenirReussie(), true);
});

test('mauvais mot de passe refuse', () => {
  const moteur = creerMoteurAuthentification();
  const utilisateur = creerUtilisateurAuth();
  assert.throws(() => moteur.authentifier({ utilisateur, motDePasseClair: 'mauvais' }), ErreurMotDePasseInvalide);
});

test('compte suspendu refuse', () => {
  const moteur = creerMoteurAuthentification();
  const utilisateur = creerUtilisateurAuth();
  utilisateur.suspendreCompte();
  assert.throws(() => moteur.authentifier({ utilisateur, motDePasseClair: 'secret' }), ErreurCompteSuspendu);
});

test('compte desactive refuse', () => {
  const moteur = creerMoteurAuthentification();
  const utilisateur = creerUtilisateurAuth({ authOfflineAutorisee: true });
  utilisateur.desactiverCompte();
  assert.throws(() => moteur.authentifier({ utilisateur, motDePasseClair: 'secret' }), ErreurCompteDesactive);
});

test('tokenVersion verifiee et conservee dans le JWT', () => {
  const moteur = creerMoteurAuthentification();
  const utilisateur = creerUtilisateurAuth();
  utilisateur.incrementerTokenVersion();
  const resultat = moteur.authentifier({ utilisateur, motDePasseClair: 'secret' });
  assert.ok(resultat.jwtToken.obtenirValeur().includes(utilisateur.obtenirId()));
});
