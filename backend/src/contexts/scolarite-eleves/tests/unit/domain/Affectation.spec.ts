import test from 'node:test';
import assert from 'node:assert/strict';
import { AffectationClasse } from '../../../domain/aggregates/AffectationClasse';
import { idsScolariteTest } from '../../fixtures/eleves.fixture';

test('Affectation affecte puis change de classe', () => {
  const affectation = AffectationClasse.creer({
    idAffectationClasse: '99999999-9999-9999-9999-999999999999',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idInscriptionScolaire: '77777777-7777-7777-7777-777777777777',
    idClassePedagogique: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    dateAffectation: '2026-09-01',
    creePar: idsScolariteTest.idUtilisateur,
  });
  affectation.changerClasse('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Changement', idsScolariteTest.idUtilisateur);
  assert.equal(affectation.obtenirIdClassePedagogique(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
});

test('Affectation se desactive sans suppression', () => {
  const affectation = AffectationClasse.creer({
    idAffectationClasse: '99999999-9999-9999-9999-999999999998',
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idInscriptionScolaire: '77777777-7777-7777-7777-777777777777',
    idClassePedagogique: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    dateAffectation: '2026-09-01',
    creePar: idsScolariteTest.idUtilisateur,
  });
  affectation.desactiver(idsScolariteTest.idUtilisateur);
  assert.equal(affectation.estActive(), false);
});
