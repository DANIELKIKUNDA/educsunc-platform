import test from 'node:test';
import assert from 'node:assert/strict';
import { creerFamilleFixture, creerResponsableFixture } from '../../fixtures/familles.fixture';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('Famille cree une famille valide', () => {
  const famille = creerFamilleFixture();
  assert.equal(famille.obtenirCodeFamille(), 'FAM-001');
});

test('Famille ajoute et definit un responsable principal', () => {
  const famille = creerFamilleFixture();
  const responsable = creerResponsableFixture();
  famille.ajouterResponsable(responsable, idsScolariteTest.idUtilisateur);
  famille.definirResponsablePrincipal(responsable.obtenirId(), idsScolariteTest.idUtilisateur);
  assert.equal(famille.listerResponsables()[0].estResponsablePrincipal(), true);
});

test('Famille detecte une famille nombreuse', () => {
  const famille = creerFamilleFixture();
  assert.equal(famille.estFamilleNombreuse(3), true);
});
