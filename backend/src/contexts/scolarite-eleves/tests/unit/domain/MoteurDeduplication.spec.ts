import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionDeduplicationEleve, MoteurDeduplicationEleve } from '../../../domain/services/MoteurDeduplicationEleve';

test('MoteurDeduplication bloque un matricule existant', () => {
  const moteur = new MoteurDeduplicationEleve();
  assert.equal(moteur.decider({
    matriculeExiste: true,
    identiteIdentiqueExiste: false,
    dateNaissanceIdentiqueExiste: false,
    familleIdentiqueExiste: false,
    ancienneInscriptionExiste: false,
    similariteProbableExiste: false,
  }), DecisionDeduplicationEleve.BLOQUER);
});
