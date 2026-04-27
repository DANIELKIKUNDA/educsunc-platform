import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurConcurrenceAgregat } from '../../../domain/services/MoteurConcurrenceAgregat';
import { ErreurConcurrence } from '../../../domain/exceptions/ErreurConcurrence';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('MoteurConcurrence refuse une mauvaise version', () => {
  const moteur = new MoteurConcurrenceAgregat();
  assert.throws(
    () => moteur.verifierVersionAttendues(idsScolariteTest.idOrganisation, idsScolariteTest.idEcole, idsScolariteTest.idUtilisateur, idsScolariteTest.idEleve, 1, 2),
    ErreurConcurrence,
  );
});
