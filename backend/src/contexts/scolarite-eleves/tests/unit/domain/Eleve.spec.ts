import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurEleveDejaDecede } from '../../../domain/exceptions/ErreurEleveDejaDecede';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { creerEleveFixture, idsScolariteTest } from '../../fixtures/eleves.fixture';

test('Eleve cree une identite permanente valide', () => {
  const eleve = creerEleveFixture();
  assert.equal(eleve.obtenirMatricule(), 'EL-001');
  assert.equal(eleve.obtenirStatutGlobal(), StatutEleve.ACTIF);
  assert.equal(eleve.recupererEvenements().length, 1);
});

test('Eleve rattache une famille puis conserve la version', () => {
  const eleve = creerEleveFixture();
  eleve.rattacherFamille(idsScolariteTest.idFamille, idsScolariteTest.idUtilisateur);
  assert.equal(eleve.obtenirIdFamille(), idsScolariteTest.idFamille);
  assert.equal(eleve.obtenirVersion(), 2);
});

test('Eleve refuse une modification active apres deces', () => {
  const eleve = creerEleveFixture();
  eleve.marquerDecede(idsScolariteTest.idUtilisateur);
  assert.throws(
    () => eleve.modifierIdentite({ nom: 'Autre', modifiePar: idsScolariteTest.idUtilisateur }),
    ErreurEleveDejaDecede,
  );
});
