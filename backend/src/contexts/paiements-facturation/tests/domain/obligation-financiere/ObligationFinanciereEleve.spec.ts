import test from 'node:test';
import assert from 'node:assert/strict';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { ErreurPaiementInvalide } from '../../../domain/exceptions/ErreurPaiementInvalide';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineAffectation } from '../../../domain/value-objects/OrigineAffectation';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutDette } from '../../../domain/value-objects/StatutDette';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

// Ce fichier teste les comportements essentiels de l'obligation financiere d'un eleve.

function creerObligation(
  montant = 10_000,
  idObligation = 'OBL-001',
): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation,
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais(idObligation.replace(/-/g, '_')),
    libelle: 'Frais scolaires annuels',
    montantDuHistorique: new Money(montant, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

test('Obligation financiere cree son montant initial', () => {
  const obligation = creerObligation(12_000);

  assert.equal(obligation.obtenirMontantDuHistorique().obtenirMontant(), 12_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 12_000);
  assert.equal(obligation.obtenirStatut(), StatutDette.NON_PAYE);
});

test('Obligation financiere solde completement apres paiement total', () => {
  const obligation = creerObligation(10_000);

  obligation.enregistrerPaiement(new Money(10_000, 'CDF'), OrigineAffectation.NORMAL);

  assert.equal(obligation.obtenirSolde().obtenirMontant(), 0);
  assert.equal(obligation.obtenirStatut(), StatutDette.SOLDE);
});

test('Obligation financiere garde un reste correct apres paiement partiel', () => {
  const obligation = creerObligation(10_000);

  obligation.enregistrerPaiement(new Money(4_000, 'CDF'), OrigineAffectation.NORMAL);

  assert.equal(obligation.obtenirMontantPaye().obtenirMontant(), 4_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 6_000);
  assert.equal(obligation.obtenirStatut(), StatutDette.PARTIEL);
});

test('Obligation financiere interdit un paiement qui depasse le solde', () => {
  const obligation = creerObligation(10_000);

  assert.throws(
    () => obligation.enregistrerPaiement(new Money(11_000, 'CDF'), OrigineAffectation.NORMAL),
    ErreurPaiementInvalide,
  );
});

test('Obligation financiere calcule exactement le reste apres plusieurs paiements', () => {
  const obligation = creerObligation(10_000);

  obligation.enregistrerPaiement(new Money(4_000, 'CDF'), OrigineAffectation.NORMAL);
  obligation.enregistrerPaiement(new Money(3_000, 'CDF'), OrigineAffectation.NORMAL);

  assert.equal(obligation.obtenirMontantPaye().obtenirMontant(), 7_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 3_000);
});

test('Obligation financiere conserve son prix historique', () => {
  const obligation = creerObligation(10_000);

  obligation.enregistrerPaiement(new Money(2_500, 'CDF'), OrigineAffectation.NORMAL);
  obligation.appliquerExoneration(new Money(1_500, 'CDF'));

  assert.equal(obligation.obtenirMontantDuHistorique().obtenirMontant(), 10_000);
});

test('Obligation financiere conserve le cumul des paiements deja appliques', () => {
  const obligation = creerObligation(10_000);

  obligation.enregistrerPaiement(new Money(2_500, 'CDF'), OrigineAffectation.NORMAL);
  obligation.enregistrerPaiement(new Money(1_500, 'CDF'), OrigineAffectation.NORMAL);

  assert.equal(obligation.obtenirMontantPaye().obtenirMontant(), 4_000);
  assert.equal(obligation.obtenirSolde().obtenirMontant(), 6_000);
});
