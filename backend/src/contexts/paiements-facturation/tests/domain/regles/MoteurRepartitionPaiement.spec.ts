import test from 'node:test';
import assert from 'node:assert/strict';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { MoteurRepartitionPaiement } from '../../../domain/services/MoteurRepartitionPaiement';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutDette } from '../../../domain/value-objects/StatutDette';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

// Ce fichier teste les regles de repartition automatique des paiements entre obligations.

function creerObligation(idObligation: string, montant: number): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation,
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais(idObligation.replace(/-/g, '_')),
    libelle: `Obligation ${idObligation}`,
    montantDuHistorique: new Money(montant, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

test('MoteurRepartitionPaiement suit l ordre chronologique des obligations recues', () => {
  const moteur = new MoteurRepartitionPaiement();
  const obligationA = creerObligation('OBL-001', 10_000);
  const obligationB = creerObligation('OBL-002', 10_000);

  const repartitions = moteur.repartir(
    'PAY-001',
    new Money(12_000, 'CDF'),
    [obligationA, obligationB],
    OrigineAffectation.NORMAL,
  );

  assert.equal(repartitions.length, 2);
  assert.equal(repartitions[0]?.obtenirIdObligation(), 'OBL-001');
  assert.equal(repartitions[1]?.obtenirIdObligation(), 'OBL-002');
  assert.equal(repartitions[0]?.obtenirOrdreAffectation(), 1);
  assert.equal(repartitions[1]?.obtenirOrdreAffectation(), 2);
});

test('MoteurRepartitionPaiement ne saute pas la premiere obligation non soldee', () => {
  const moteur = new MoteurRepartitionPaiement();
  const obligationA = creerObligation('OBL-001', 10_000);
  const obligationB = creerObligation('OBL-002', 10_000);

  const repartitions = moteur.repartir(
    'PAY-001',
    new Money(5_000, 'CDF'),
    [obligationA, obligationB],
    OrigineAffectation.NORMAL,
  );

  assert.equal(repartitions.length, 1);
  assert.equal(repartitions[0]?.obtenirIdObligation(), 'OBL-001');
  assert.equal(obligationA.obtenirStatut(), StatutDette.PARTIEL);
  assert.equal(obligationB.obtenirStatut(), StatutDette.NON_PAYE);
});

test('MoteurRepartitionPaiement ne repaie pas une obligation deja soldee', () => {
  const moteur = new MoteurRepartitionPaiement();
  const obligationSoldee = creerObligation('OBL-001', 10_000);
  const obligationSuivante = creerObligation('OBL-002', 10_000);

  obligationSoldee.enregistrerPaiement(new Money(10_000, 'CDF'), OrigineAffectation.NORMAL);

  const repartitions = moteur.repartir(
    'PAY-001',
    new Money(3_000, 'CDF'),
    [obligationSoldee, obligationSuivante],
    OrigineAffectation.NORMAL,
  );

  assert.equal(repartitions.length, 1);
  assert.equal(repartitions[0]?.obtenirIdObligation(), 'OBL-002');
  assert.equal(obligationSuivante.obtenirMontantPaye().obtenirMontant(), 3_000);
});

test('MoteurRepartitionPaiement applique le paiement a la premiere obligation non soldee', () => {
  const moteur = new MoteurRepartitionPaiement();
  const obligationA = creerObligation('OBL-001', 10_000);
  const obligationB = creerObligation('OBL-002', 10_000);

  obligationA.enregistrerPaiement(new Money(10_000, 'CDF'), OrigineAffectation.NORMAL);

  const repartitions = moteur.repartir(
    'PAY-002',
    new Money(2_000, 'CDF'),
    [obligationA, obligationB],
    OrigineAffectation.NORMAL,
  );

  assert.equal(repartitions.length, 1);
  assert.equal(repartitions[0]?.obtenirIdObligation(), 'OBL-002');
  assert.equal(obligationB.obtenirMontantPaye().obtenirMontant(), 2_000);
});
