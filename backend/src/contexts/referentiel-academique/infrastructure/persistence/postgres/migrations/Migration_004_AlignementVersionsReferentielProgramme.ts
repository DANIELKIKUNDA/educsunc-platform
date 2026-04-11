import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration aligne la table des versions sur le modele racine -> version publiee.
export const migration004AlignementVersionsReferentielProgramme:
  MigrationPostgresReferentielAcademique = {
    idMigration: '004_alignement_versions_referentiel_programme',
    description: 'Ajout de la publication persistante et de l unicite par referentiel des versions.',

    genererSqlMontee(): readonly string[] {
      return [
        [
          'ALTER TABLE "versions_referentiel_programme"',
          'ADD COLUMN IF NOT EXISTS "publiee" boolean NOT NULL DEFAULT false;',
        ].join(' '),
        [
          'UPDATE "versions_referentiel_programme"',
          'SET "publiee" = true',
          'WHERE "publiee" = false;',
        ].join(' '),
        'DROP INDEX IF EXISTS "ux_versions_referentiel_programme_code_version";',
        [
          'CREATE UNIQUE INDEX IF NOT EXISTS',
          '"ux_versions_referentiel_programme_referentiel_code_version"',
          'ON "versions_referentiel_programme" ("id_referentiel_programme", "code_version");',
        ].join(' '),
        [
          'CREATE INDEX IF NOT EXISTS "ix_versions_referentiel_programme_publiee"',
          'ON "versions_referentiel_programme" ("publiee");',
        ].join(' '),
        [
          `COMMENT ON COLUMN "versions_referentiel_programme"."publiee" IS`,
          '\'Indique si la version a ete publiee et verrouillee metierement.\';',
        ].join(' '),
        [
          `COMMENT ON INDEX "ux_versions_referentiel_programme_referentiel_code_version" IS`,
          '\'Garantit l unicite du code de version a l interieur d un referentiel.\';',
        ].join(' '),
        [
          `COMMENT ON INDEX "ix_versions_referentiel_programme_publiee" IS`,
          '\'Accelere la lecture des versions publiees.\';',
        ].join(' '),
      ];
    },

    genererSqlDescente(): readonly string[] {
      return [
        'DROP INDEX IF EXISTS "ix_versions_referentiel_programme_publiee";',
        'DROP INDEX IF EXISTS "ux_versions_referentiel_programme_referentiel_code_version";',
        [
          'CREATE UNIQUE INDEX IF NOT EXISTS "ux_versions_referentiel_programme_code_version"',
          'ON "versions_referentiel_programme" ("code_version");',
        ].join(' '),
        'ALTER TABLE "versions_referentiel_programme" DROP COLUMN IF EXISTS "publiee";',
      ];
    },
  };
