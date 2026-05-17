import test from 'node:test';
import assert from 'node:assert/strict';
import { MoteurApplicationConduite } from 'contexts/bulletins-evaluations/domain/services/MoteurApplicationConduite';
import { MoteurCalculBulletin } from 'contexts/bulletins-evaluations/domain/services/MoteurCalculBulletin';
import { MoteurClassementBulletin } from 'contexts/bulletins-evaluations/domain/services/MoteurClassementBulletin';
import { MoteurMigrationBulletin } from 'contexts/bulletins-evaluations/domain/services/MoteurMigrationBulletin';
import { MoteurNonClasse } from 'contexts/bulletins-evaluations/domain/services/MoteurNonClasse';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import {
  creerClassement,
  creerDiff,
  creerFicheCotation,
  creerLigneClassement,
  creerMigration,
  creerResultatBulletin,
  creerTransformation,
} from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier verifie les moteurs metier purs du BC.
test('les moteurs de domaine orchestrent bien les calculs attendus', () => {
  const fiche = creerFicheCotation();
  fiche.encoderCote(CodeColonneBulletin.P1, 8, 'user-1');

  const resultat = creerResultatBulletin();
  new MoteurCalculBulletin().recalculer(resultat, [fiche]);
  assert.equal(resultat.obtenirResultatsColonnes()[0].obtenirTotalObtenu(), 8);

  new MoteurApplicationConduite().calculerApplication(resultat, CodePeriodeSimple.P1, 72);
  new MoteurApplicationConduite().encoderConduite(resultat, CodePeriodeSimple.P1, 88, 'user-1');
  assert.equal(resultat.obtenirApplicationsPeriodes()[0].obtenirMentionApplication(), 'TB');
  assert.equal(resultat.obtenirConduitesPeriodes()[0].obtenirPointsConduite(), 88);

  const moteurNonClasse = new MoteurNonClasse();
  const ficheIncomplete = creerFicheCotation();
  assert.equal(moteurNonClasse.determiner([ficheIncomplete], CodeColonneBulletin.P1), true);

  const classement = creerClassement();
  new MoteurClassementBulletin().recalculerClassement(classement, [
    creerLigneClassement({ totalObtenu: 150, maximumGeneral: 200, pourcentage: 75, rang: 1 }),
    creerLigneClassement({ totalObtenu: 100, maximumGeneral: 200, pourcentage: 50, rang: 2 }),
  ]);
  assert.equal(classement.obtenirLignesClassement()[0].obtenirTotalObtenu(), 150);

  const migration = creerMigration();
  const moteurMigration = new MoteurMigrationBulletin();
  moteurMigration.analyser(migration, [creerDiff()]);
  moteurMigration.convertirCotes(migration, [creerTransformation()]);
  moteurMigration.appliquer(migration);
  assert.equal(migration.obtenirDiffsColonnesBulletin().length, 1);
});
