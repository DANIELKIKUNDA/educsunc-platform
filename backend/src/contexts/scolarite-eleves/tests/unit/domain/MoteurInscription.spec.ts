import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurInscriptionEleve } from '../../../domain/services/MoteurInscriptionEleve';
import { creerEleveFixture } from '../../fixtures/eleves.fixture';

test('MoteurInscription autorise une inscription valide', () => {
  const moteur = new MoteurInscriptionEleve();
  assert.doesNotThrow(() => moteur.verifierCreationPossible({
    eleve: creerEleveFixture(),
    anneeScolaireExiste: true,
    anneeScolaireActiveOuSelectionnee: true,
    inscriptionActiveExisteDeja: false,
  }));
});
