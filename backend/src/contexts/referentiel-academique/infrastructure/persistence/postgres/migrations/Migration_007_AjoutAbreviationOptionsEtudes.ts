import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute l'abreviation des options d'etudes sans retirer le champ legacy type_option.
export const migration007AjoutAbreviationOptionsEtudes:
  MigrationPostgresReferentielAcademique = {
    idMigration: '007_ajout_abreviation_options_etudes',
    description: "Ajout additif de l'abreviation des options d'etudes.",

    genererSqlMontee(): readonly string[] {
      return [
        'ALTER TABLE "options_etudes" ADD COLUMN IF NOT EXISTS "abreviation" varchar(40) NULL;',
        'COMMENT ON COLUMN "options_etudes"."abreviation" IS \'Abreviation officielle ou locale de l option d etude.\';',
      ];
    },

    genererSqlDescente(): readonly string[] {
      return [
        'ALTER TABLE "options_etudes" DROP COLUMN IF EXISTS "abreviation";',
      ];
    },
  };
