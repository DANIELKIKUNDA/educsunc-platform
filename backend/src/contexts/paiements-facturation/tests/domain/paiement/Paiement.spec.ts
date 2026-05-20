import test from 'node:test';
import assert from 'node:assert/strict';
import { Paiement } from '../../../domain/aggregates/Paiement';
import { RepartitionPaiement } from '../../../domain/entities/RepartitionPaiement';
import { CiblePaiement } from '../../../domain/value-objects/CiblePaiement';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { StatutPaiement } from '../../../domain/value-objects/StatutPaiement';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

// Ce fichier teste les invariants essentiels de l'agregat Paiement.

function creerPaiement(montant: number, idPaiement = 'PAY-001'): Paiement {
  return Paiement.creer({
    idPaiement,
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    montantTotal: new Money(montant, 'CDF'),
    modePaiement: ModePaiement.CASH,
    typeFraisDeclare: TypeFrais.FRAIS_SCOLAIRES,
    ciblePaiement: CiblePaiement.STANDARD,
    idempotencyKey: `IDEMP-${idPaiement}`,
    creePar: 'UTIL-001',
  });
}

function creerRepartition(idPaiement: string, montant: number): RepartitionPaiement {
  return new RepartitionPaiement({
    idRepartition: `${idPaiement}-REP-1`,
    idPaiement,
    idObligation: 'OBL-001',
    montantAffecte: new Money(montant, 'CDF'),
    ordreAffectation: 1,
    origineAffectation: OrigineAffectation.NORMAL,
  });
}

test('Paiement refuse un montant negatif', () => {
  assert.throws(() => new Money(-1, 'CDF'));
});

test('Paiement refuse un montant zero', () => {
  assert.throws(() => creerPaiement(0));
});

test('Paiement accepte un montant valide', () => {
  const paiement = creerPaiement(15_000);

  assert.equal(paiement.obtenirMontantTotal().obtenirMontant(), 15_000);
  assert.equal(paiement.obtenirStatutPaiement(), StatutPaiement.ENREGISTRE);
  assert.equal(paiement.recupererEvenements().length, 1);
});

test('Paiement conserve des identifiants distincts quand ils sont fournis distinctement', () => {
  const paiementA = creerPaiement(10_000, 'PAY-001');
  const paiementB = creerPaiement(10_000, 'PAY-002');

  assert.notEqual(paiementA.obtenirId(), paiementB.obtenirId());
});

test('Paiement expose des copies defensives apres creation', () => {
  const paiement = creerPaiement(8_000);
  const repartition = creerRepartition(paiement.obtenirId(), 8_000);

  paiement.repartir([repartition]);

  const dateExposee = paiement.obtenirCreeLe();
  dateExposee.setUTCFullYear(2035);

  const repartitionsExposees = paiement.obtenirRepartitions();
  repartitionsExposees.push(repartition);

  assert.notEqual(paiement.obtenirCreeLe().getUTCFullYear(), 2035);
  assert.equal(paiement.obtenirRepartitions().length, 1);
});
