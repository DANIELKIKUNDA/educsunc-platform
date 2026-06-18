import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurClasseDejaTitulaire, ErreurTitulariatInvalide, MoteurTitulariat } from 'shared/security/domain';
import { creerAffectationTitulariat } from '../support/SecurityTestSupport';

test('doit affecter titulaire a classe et annee scolaire', () => {
  const titulariat = creerAffectationTitulariat();

  assert.equal(titulariat.obtenirIdOrganisation(), 'org-1');
  assert.equal(titulariat.obtenirIdEcole(), 'ecole-1');
  assert.equal(titulariat.obtenirIdClasse(), 'classe-1');
  assert.equal(titulariat.obtenirIdAnneeScolaire(), 'annee-1');
  assert.equal(titulariat.obtenirEstActif(), true);
});

test('doit empecher double titulariat actif', () => {
  const moteur = new MoteurTitulariat();
  assert.throws(() => moteur.attribuerTitulariat({
    idUtilisateur: 'u1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
    classePossedeDejaTitulaire: true,
    codeRoleActif: 'ENSEIGNANT',
    affectationActive: true,
    idOrganisationAffectation: 'org-1',
    idEcoleAffectation: 'ecole-1',
  }), ErreurClasseDejaTitulaire);
});

test('doit cloturer un titulariat retire', () => {
  const titulariat = creerAffectationTitulariat();
  titulariat.retirer();

  assert.equal(titulariat.obtenirEstActif(), false);
  assert.ok(titulariat.obtenirDateFin() instanceof Date);
  assert.throws(() => titulariat.verifierTitulariat(), ErreurTitulariatInvalide);
});
