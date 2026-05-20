import test from 'node:test';
import assert from 'node:assert/strict';
import { EtatCompteUtilisateur, ErreurCompteDesactive, ErreurCompteSuspendu } from 'shared/auth/domain';
import { creerUtilisateurAuth } from '../support/AuthTestSupport';

test('doit creer utilisateur ACTIVE avec tokenVersion=1 et date creation', () => {
  const utilisateur = creerUtilisateurAuth();

  assert.ok(utilisateur.obtenirId());
  assert.equal(utilisateur.obtenirEtatCompte(), EtatCompteUtilisateur.ACTIVE);
  assert.equal(utilisateur.obtenirTokenVersion().obtenirValeur(), 1);
  assert.ok(utilisateur.obtenirCreeLe() instanceof Date);
});

test('doit refuser email vide ou invalide', () => {
  assert.throws(() => creerUtilisateurAuth({ email: '' }));
  assert.throws(() => creerUtilisateurAuth({ email: 'email-invalide' }));
});

test('doit suspendre le compte et produire un evenement', () => {
  const utilisateur = creerUtilisateurAuth();
  utilisateur.suspendreCompte();

  assert.equal(utilisateur.obtenirEtatCompte(), EtatCompteUtilisateur.SUSPENDED);
  assert.throws(() => utilisateur.verifierConnexionAutorisee(), ErreurCompteSuspendu);
  assert.ok(utilisateur
    .recupererEvenements()
    .some((event) => event.constructor.name === 'CompteSuspendu'));
});

test('doit desactiver le compte, invalider la tokenVersion et bloquer l authentification', () => {
  const utilisateur = creerUtilisateurAuth();
  const tokenVersionInitiale = utilisateur.obtenirTokenVersion().obtenirValeur();

  utilisateur.desactiverCompte();

  assert.equal(utilisateur.obtenirEtatCompte(), EtatCompteUtilisateur.DISABLED);
  assert.ok(utilisateur.obtenirTokenVersion().obtenirValeur() > tokenVersionInitiale);
  assert.throws(() => utilisateur.verifierConnexionAutorisee(), ErreurCompteDesactive);
  assert.ok(utilisateur
    .recupererEvenements()
    .some((event) => event.constructor.name === 'CompteDesactive'));
});

test('doit incrementer tokenVersion pour invalider les anciens jetons', () => {
  const utilisateur = creerUtilisateurAuth();
  const tokenVersionInitiale = utilisateur.obtenirTokenVersion().obtenirValeur();

  utilisateur.incrementerTokenVersion();

  assert.equal(utilisateur.obtenirTokenVersion().obtenirValeur(), tokenVersionInitiale + 1);
});
