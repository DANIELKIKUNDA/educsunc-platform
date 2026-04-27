import test from 'node:test';
import assert from 'node:assert/strict';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { creerEleveFixture, idsScolariteTest } from '../../fixtures/eleves.fixture';

test('CycleVie applique abandon transfert reintegration suspension', () => {
  const eleve = creerEleveFixture();
  eleve.marquerAbandonne(idsScolariteTest.idUtilisateur);
  assert.equal(eleve.obtenirStatutGlobal(), StatutEleve.ABANDONNE);
  eleve.reactiver(idsScolariteTest.idUtilisateur);
  eleve.suspendre(idsScolariteTest.idUtilisateur);
  assert.equal(eleve.obtenirStatutGlobal(), StatutEleve.SUSPENDU);
});
