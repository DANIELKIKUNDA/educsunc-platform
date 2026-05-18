import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurRecalculDifferentiel } from 'contexts/bulletins-evaluations/domain/services/MoteurRecalculDifferentiel';
import { MoteurValidationBulletin } from 'contexts/bulletins-evaluations/domain/services/MoteurValidationBulletin';
import { DiagnosticTechniqueAcademique } from 'contexts/bulletins-evaluations/domain/entities/DiagnosticTechniqueAcademique';
import { NiveauGraviteAnomalie } from 'contexts/bulletins-evaluations/domain/value-objects/NiveauGraviteAnomalie';
import { TypeAnomalieAcademique } from 'contexts/bulletins-evaluations/domain/value-objects/TypeAnomalieAcademique';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { creerBulletin } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les nouveaux moteurs enterprise ajoutes au domaine.
test('le moteur de validation accepte un bulletin complet sans anomalie bloquante', () => {
  const bulletin = creerBulletin({
    blocsApplicationConduite: [],
  });
  bulletin.genererOuMettreAJour({
    lignesBulletin: [],
    blocsApplicationConduite: [],
    generePar: 'prefet-1',
  });

  const resultat = new MoteurValidationBulletin().valider({
    bulletin,
    diagnostics: [],
    versionReferentielAttendue: bulletin.obtenirVersionReferentielProgramme(),
  });

  assert.equal(resultat.validationReussie, true);
  assert.equal(resultat.bloquant, false);
});

test('le moteur de validation bloque un bulletin avec anomalie critique', () => {
  const bulletin = creerBulletin();
  const diagnostic = new DiagnosticTechniqueAcademique({
    idDiagnosticTechniqueAcademique: 'diag-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    typeAnomalie: TypeAnomalieAcademique.POURCENTAGE_INCOHERENT,
    niveauGravite: NiveauGraviteAnomalie.CRITIQUE,
    message: 'Pourcentage incoherent',
    detecteLe: new Date(),
    detecteParMoteur: 'test',
  });

  assert.throws(() =>
    new MoteurValidationBulletin().valider({
      bulletin,
      diagnostics: [diagnostic],
      versionReferentielAttendue: bulletin.obtenirVersionReferentielProgramme(),
    }));
});

test('le moteur de recalcul differentiel limite les actions a la colonne impactee', () => {
  const moteur = new MoteurRecalculDifferentiel();
  const actionsP1 = moteur.determinerActions(CodeColonneBulletin.P1);
  const actionsEx1 = moteur.determinerActions(CodeColonneBulletin.EX1);

  assert.equal(actionsP1.includes('RECALCUL_CLASSEMENT_P1'), true);
  assert.equal(actionsP1.includes('MISE_A_JOUR_PROCLAMATION_P1'), true);
  assert.equal(actionsEx1.includes('RECALCUL_RESULTAT_TOTAL_S1'), true);
  assert.equal(actionsEx1.includes('RECALCUL_CLASSEMENT_TOTAL_S1'), true);
});
