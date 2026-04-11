import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration supprime les colonnes legacy versionnees du referentiel programme racine.
export const migration005NettoyageLegacyReferentielProgramme:
  MigrationPostgresReferentielAcademique = {
    idMigration: '005_nettoyage_legacy_referentiel_programme',
    description: 'Suppression des colonnes legacy versionnees du referentiel programme racine.',

    genererSqlMontee(): readonly string[] {
      return [
        'DROP INDEX IF EXISTS "ux_referentiels_programmes_classe_version";',
        'DROP INDEX IF EXISTS "ix_referentiels_programmes_source_actif";',
        [
          'CREATE INDEX IF NOT EXISTS "ix_referentiels_programmes_classe_academique"',
          'ON "referentiels_programmes" ("id_classe_academique");',
        ].join(' '),
        [
          `COMMENT ON INDEX "ix_referentiels_programmes_classe_academique" IS`,
          '\'Accelere les lectures des referentiels par classe academique.\';',
        ].join(' '),
        'ALTER TABLE "referentiels_programmes" DROP COLUMN IF EXISTS "version_referentiel";',
        'ALTER TABLE "referentiels_programmes" DROP COLUMN IF EXISTS "date_publication";',
        'ALTER TABLE "referentiels_programmes" DROP COLUMN IF EXISTS "source";',
      ];
    },

    genererSqlDescente(): readonly string[] {
      return [
        [
          'ALTER TABLE "referentiels_programmes"',
          'ADD COLUMN IF NOT EXISTS "version_referentiel" varchar(80);',
        ].join(' '),
        [
          'ALTER TABLE "referentiels_programmes"',
          'ADD COLUMN IF NOT EXISTS "date_publication" date;',
        ].join(' '),
        [
          'ALTER TABLE "referentiels_programmes"',
          'ADD COLUMN IF NOT EXISTS "source" varchar(60);',
        ].join(' '),
        [
          'UPDATE "referentiels_programmes" AS rp',
          'SET "version_referentiel" = selection.code_version,',
          '"date_publication" = selection.date_publication,',
          '"source" = selection.source_import',
          'FROM (',
          'SELECT DISTINCT ON (vrp.id_referentiel_programme)',
          'vrp.id_referentiel_programme,',
          'vrp.code_version,',
          'vrp.date_publication,',
          'vrp.source_import',
          'FROM "versions_referentiel_programme" vrp',
          'ORDER BY vrp.id_referentiel_programme, vrp.active DESC, vrp.date_publication DESC, vrp.cree_le DESC, vrp.id DESC',
          ') AS selection',
          'WHERE selection.id_referentiel_programme = rp.id;',
        ].join(' '),
        [
          'UPDATE "referentiels_programmes"',
          'SET "version_referentiel" = COALESCE("version_referentiel", \'LEGACY-VIDE\'),',
          '"date_publication" = COALESCE("date_publication", CURRENT_DATE),',
          '"source" = COALESCE("source", \'JSON_OFFICIEL\');',
        ].join(' '),
        [
          'ALTER TABLE "referentiels_programmes"',
          'ALTER COLUMN "version_referentiel" SET NOT NULL;',
        ].join(' '),
        [
          'ALTER TABLE "referentiels_programmes"',
          'ALTER COLUMN "date_publication" SET NOT NULL;',
        ].join(' '),
        [
          'ALTER TABLE "referentiels_programmes"',
          'ALTER COLUMN "source" SET NOT NULL;',
        ].join(' '),
        'DROP INDEX IF EXISTS "ix_referentiels_programmes_classe_academique";',
        [
          'CREATE UNIQUE INDEX IF NOT EXISTS "ux_referentiels_programmes_classe_version"',
          'ON "referentiels_programmes" ("id_classe_academique", "version_referentiel");',
        ].join(' '),
        [
          'CREATE INDEX IF NOT EXISTS "ix_referentiels_programmes_source_actif"',
          'ON "referentiels_programmes" ("source", "actif");',
        ].join(' '),
        [
          `COMMENT ON INDEX "ux_referentiels_programmes_classe_version" IS`,
          '\'Garantit une version unique par classe academique.\';',
        ].join(' '),
        [
          `COMMENT ON INDEX "ix_referentiels_programmes_source_actif" IS`,
          '\'Accelere les lectures par source et etat.\';',
        ].join(' '),
        [
          `COMMENT ON COLUMN "referentiels_programmes"."version_referentiel" IS`,
          '\'Code de version exploite par le referentiel.\';',
        ].join(' '),
        [
          `COMMENT ON COLUMN "referentiels_programmes"."date_publication" IS`,
          '\'Date de publication officielle du referentiel.\';',
        ].join(' '),
        [
          `COMMENT ON COLUMN "referentiels_programmes"."source" IS`,
          '\'Source metier du referentiel programme.\';',
        ].join(' '),
      ];
    },
  };
