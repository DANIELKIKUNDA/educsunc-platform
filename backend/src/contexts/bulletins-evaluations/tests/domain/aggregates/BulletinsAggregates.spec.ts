import test from 'node:test';
import assert from 'node:assert/strict';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { StatutMigrationBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/StatutMigrationBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import {
  creerBulletin,
  creerClassement,
  creerDiff,
  creerEleveAbandon,
  creerEleveNonClasse,
  creerFicheCotation,
  creerHistoriqueGenerationBulletin,
  creerHistoriqueGenerationProclamation,
  creerLigneClassement,
  creerLigneProclamation,
  creerLigneSynthese,
  creerMigration,
  creerProclamation,
  creerResultatBulletin,
  creerSynthese,
  creerTransformation,
} from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les invariants essentiels des agregats du BC Bulletins & Evaluations.
test('les agregats gerent les comportements documentaires principaux', () => {
  const fiche = creerFicheCotation({ typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL });
  fiche.encoderCote(CodeColonneBulletin.P1, 8, 'user-1');
  fiche.encoderCote(CodeColonneBulletin.P2, 7, 'user-1');
  fiche.encoderCote(CodeColonneBulletin.EX1, 9, 'user-1');
  fiche.calculerColonnesTotal();
  assert.equal(fiche.obtenirCoteParColonne(CodeColonneBulletin.TOTAL_S1)?.obtenirCoteObtenue(), 24);

  const resultat = creerResultatBulletin();
  resultat.recalculerDepuisFiches([fiche]);
  assert.equal(resultat.obtenirResultatsColonnes().at(0)?.obtenirEstNonClasse(), false);

  const classement = creerClassement();
  const ligne1 = creerLigneClassement({ totalObtenu: 150, maximumGeneral: 200, pourcentage: 75, rang: 1 });
  const ligne2 = creerLigneClassement({ totalObtenu: 150, maximumGeneral: 200, pourcentage: 75, rang: 2 });
  const ligne3 = creerLigneClassement({ estNonClasse: true, totalObtenu: undefined, maximumGeneral: undefined, pourcentage: undefined, rang: undefined });
  classement.recalculerClassement([ligne1, ligne2, ligne3]);
  assert.equal(classement.obtenirLignesClassement().length, 2);
  assert.equal(classement.obtenirLignesClassement()[0].obtenirRang(), 1);
  assert.equal(classement.obtenirLignesClassement()[1].obtenirRang(), 1);

  const bulletin = creerBulletin({ lignesBulletin: [], historiqueGeneration: [] });
  bulletin.genererOuMettreAJour({
    lignesBulletin: [],
    blocsApplicationConduite: [],
    generePar: 'user-1',
    motifGeneration: 'TEST',
  });
  bulletin.ajouterHistoriqueGeneration(creerHistoriqueGenerationBulletin());
  bulletin.figerVersion();
  assert.equal(bulletin.obtenirEtatBulletin(), 'FINALISE');
  assert.ok(bulletin.obtenirVersionBulletin() >= 2);

  const proclamation = creerProclamation({ lignesProclamation: [], elevesNonClasses: [], elevesAbandon: [], historiqueGeneration: [] });
  proclamation.generer({
    lignesProclamation: [creerLigneProclamation()],
    elevesNonClasses: [creerEleveNonClasse()],
    elevesAbandon: [creerEleveAbandon()],
    historiqueGeneration: creerHistoriqueGenerationProclamation(),
  });
  proclamation.calculerStatistiques();
  assert.equal(proclamation.obtenirElevesNonClasses().length, 1);
  assert.equal(proclamation.obtenirElevesAbandon().length, 1);
  assert.ok(proclamation.obtenirStatistiquesProclamation() !== undefined);

  const synthese = creerSynthese({ lignesSyntheseResultatsClasse: [] });
  synthese.genererDepuisProclamations([creerLigneSynthese()]);
  synthese.calculerTotauxEcole();
  assert.equal(synthese.obtenirLignesSyntheseResultatsClasse().length, 1);
  assert.ok(synthese.obtenirTotauxSyntheseEcole() !== undefined);

  const migration = creerMigration();
  migration.analyser([creerDiff()]);
  migration.convertirCotes([creerTransformation()]);
  migration.appliquer();
  assert.equal(migration.obtenirStatutMigration(), StatutMigrationBulletin.APPLIQUEE);
  assert.equal(migration.obtenirTransformationsCoteBulletin().length, 1);
});
