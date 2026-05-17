import test from 'node:test';
import assert from 'node:assert/strict';
import { BulletinGenere } from 'contexts/bulletins-evaluations/domain/events/BulletinGenere';
import { ClassementColonneRecalcule } from 'contexts/bulletins-evaluations/domain/events/ClassementColonneRecalcule';
import { CoteEncodee } from 'contexts/bulletins-evaluations/domain/events/CoteEncodee';
import { MigrationBulletinAppliquee } from 'contexts/bulletins-evaluations/domain/events/MigrationBulletinAppliquee';
import { ProclamationClasseGeneree } from 'contexts/bulletins-evaluations/domain/events/ProclamationClasseGeneree';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

// Ce fichier verifie la creation des principaux evenements metier du BC.
test('les evenements exposent un payload coherent et horodate', () => {
  const coteEncodee = new CoteEncodee('fiche-1', CodeColonneBulletin.P1);
  const bulletinGenere = new BulletinGenere('bulletin-1', 'eleve-1');
  const classement = new ClassementColonneRecalcule('classement-1', CodeColonneBulletin.TOTAL_GENERAL);
  const proclamation = new ProclamationClasseGeneree('proclamation-1', 'classe-1');
  const migration = new MigrationBulletinAppliquee('migration-1');

  assert.ok(coteEncodee.dateEvenement instanceof Date);
  assert.equal(bulletinGenere.typeEvenement.length > 0, true);
  assert.equal(classement.typeEvenement.length > 0, true);
  assert.equal(proclamation.typeEvenement.length > 0, true);
  assert.equal(migration.typeEvenement.length > 0, true);
});
