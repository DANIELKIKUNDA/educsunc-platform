import test from 'node:test';
import assert from 'node:assert/strict';
import { InscriptionScolaire } from '../../../domain/aggregates/InscriptionScolaire';
import { OrigineInscription } from '../../../domain/value-objects/OrigineInscription';
import { StatutInscription } from '../../../domain/value-objects/StatutInscription';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('Inscription cree, valide et annule une inscription', () => {
  const inscription = InscriptionScolaire.creer({
    idInscriptionScolaire: '77777777-7777-7777-7777-777777777777',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idEleve: idsScolariteTest.idEleve,
    idAnneeScolaire: '88888888-8888-8888-8888-888888888888',
    dateInscription: '2026-09-01',
    origineInscription: OrigineInscription.NOUVEAU,
    creePar: idsScolariteTest.idUtilisateur,
  });
  inscription.valider(idsScolariteTest.idUtilisateur);
  assert.equal(inscription.obtenirStatutInscription(), StatutInscription.VALIDEE);
  inscription.annuler(idsScolariteTest.idUtilisateur);
  assert.equal(inscription.obtenirStatutInscription(), StatutInscription.ANNULEE);
});
