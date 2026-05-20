import test from 'node:test';
import assert from 'node:assert/strict';
import { ObligationFinanciereEleve } from '../../../domain/aggregates/ObligationFinanciereEleve';
import { PolicyAnticipationFrais } from '../../../domain/policies/PolicyAnticipationFrais';
import { PolicyExoneration } from '../../../domain/policies/PolicyExoneration';
import { PolicyLissageFrais } from '../../../domain/policies/PolicyLissageFrais';
import { Money } from '../../../domain/value-objects/Money';
import { OrigineObligation } from '../../../domain/value-objects/OrigineObligation';
import { ReferenceFrais } from '../../../domain/value-objects/ReferenceFrais';
import { StatutDette } from '../../../domain/value-objects/StatutDette';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

// Ce fichier teste les policies simples du domaine paiements-facturation.

function creerObligation(montant = 10_000): ObligationFinanciereEleve {
  return ObligationFinanciereEleve.creer({
    idObligation: 'OBL-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
    idAnneeScolaire: 'ANNEE-001',
    typeFrais: TypeFrais.FRAIS_SCOLAIRES,
    referenceFrais: new ReferenceFrais('OBL_001_FRAIS'),
    libelle: 'Frais scolaires annuels',
    montantDuHistorique: new Money(montant, 'CDF'),
    origineCreation: OrigineObligation.GENERATION_INITIALE,
    creePar: 'UTIL-001',
  });
}

test('PolicyExoneration valide une exonération autorisee et l obligation peut tomber a zero', () => {
  const policy = new PolicyExoneration();
  const obligation = creerObligation(10_000);

  policy.verifier('UTIL-001', 10_000);
  obligation.appliquerExoneration(new Money(10_000, 'CDF'));

  assert.equal(obligation.obtenirSolde().obtenirMontant(), 0);
  assert.equal(obligation.obtenirStatut(), StatutDette.EXONERE);
});

test('PolicyAnticipationFrais detecte une anticipation autorisee', () => {
  const policy = new PolicyAnticipationFrais();

  assert.doesNotThrow(() => policy.verifier(true));
  assert.throws(() => policy.verifier(false));
});

test('PolicyLissageFrais reste coherente quand le plan est complet', () => {
  const policy = new PolicyLissageFrais();

  assert.doesNotThrow(() => policy.verifier(true, true, true));
  assert.throws(() => policy.verifier(true, false, true));
});
