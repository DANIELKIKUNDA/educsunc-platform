import test from 'node:test';
import assert from 'node:assert/strict';
import { ParcoursScolaireEleve } from '../../../domain/aggregates/ParcoursScolaireEleve';
import { EvenementParcours } from '../../../domain/entities/EvenementParcours';
import { TypeEvenementParcours } from '../../../domain/value-objects/TypeEvenementParcours';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('Parcours ajoute et reconstruit un historique', () => {
  const parcours = ParcoursScolaireEleve.creer('cccccccc-cccc-cccc-cccc-cccccccccccc', idsScolariteTest.idOrganisation, idsScolariteTest.idEcole, idsScolariteTest.idEleve);
  const evenement = EvenementParcours.creer({
    idEvenementParcours: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    typeEvenement: TypeEvenementParcours.INSCRIPTION,
    dateEvenement: new Date('2026-09-01T00:00:00.000Z'),
    declenchePar: idsScolariteTest.idUtilisateur,
  });
  parcours.enregistrerEvenement(evenement);
  parcours.reconstruireParcours(parcours.listerHistorique(), idsScolariteTest.idUtilisateur);
  assert.equal(parcours.listerHistorique().length, 1);
});
