import test from 'node:test';
import assert from 'node:assert/strict';
import { migrationsPostgresReferentielAcademique } from '../infrastructure/persistence/postgres/migrations';

test('les migrations PostgreSQL du BC incluent bien le RLS local', () => {
  const migrationRls = migrationsPostgresReferentielAcademique.find(
    (migration) => migration.idMigration === '006_rls_tables_locales_referentiel_academique',
  );

  assert.ok(migrationRls, 'La migration RLS 006 doit etre presente.');

  const sqlMontee = migrationRls.genererSqlMontee().join('\n');

  assert.match(sqlMontee, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sqlMontee, /FORCE ROW LEVEL SECURITY/);
  assert.match(sqlMontee, /CREATE POLICY "rls_annees_scolaires_lecture"/);
  assert.match(sqlMontee, /CREATE POLICY "rls_programmes_niveau_insertion"/);
  assert.match(sqlMontee, /CREATE POLICY "rls_transformations_note_suppression"/);
});

test('les migrations sont ordonnees jusqu au RLS puis a l ajout additif des abreviations', () => {
  const identifiants = migrationsPostgresReferentielAcademique.map(
    (migration) => migration.idMigration,
  );

  assert.deepEqual(identifiants, [
    '001_tables_globales_referentiel_academique',
    '002_tables_locales_ecole_referentiel_academique',
    '003_tables_techniques_associees_referentiel_academique',
    '004_alignement_versions_referentiel_programme',
    '005_nettoyage_legacy_referentiel_programme',
    '006_rls_tables_locales_referentiel_academique',
    '007_ajout_abreviation_options_etudes',
  ]);
});
