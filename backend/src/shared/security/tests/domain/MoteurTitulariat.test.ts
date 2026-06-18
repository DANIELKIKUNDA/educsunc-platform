import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurClasseDejaTitulaire, ErreurTitulariatInvalide, MoteurTitulariat } from 'shared/security/domain';
import { creerAffectationTitulariat } from '../support/SecurityTestSupport';

test('moteur titulariat valide classe titulaire et refuse hors disponibilite', () => {
  const moteur = new MoteurTitulariat();
  const titulariat = creerAffectationTitulariat();
  moteur.verifierTitulariat(titulariat);

  titulariat.retirer();
  assert.throws(() => moteur.verifierTitulariat(titulariat), ErreurTitulariatInvalide);
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
