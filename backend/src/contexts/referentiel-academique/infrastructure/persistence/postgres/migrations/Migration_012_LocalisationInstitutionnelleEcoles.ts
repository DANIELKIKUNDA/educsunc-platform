import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute la localisation institutionnelle detaillee des ecoles.
export const migration012LocalisationInstitutionnelleEcoles: MigrationPostgresReferentielAcademique = {
  idMigration: '012_localisation_institutionnelle_ecoles',
  description: "Ajout des champs province educationnelle, ville et commune ou territoire sur les ecoles pour alimenter les documents officiels.",

  genererSqlMontee(): readonly string[] {
    return [
      'ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "province_educationnelle" varchar(255) NULL;',
      `COMMENT ON COLUMN "ecoles"."province_educationnelle" IS 'Province educationnelle de reference de l''ecole.';`,
      'ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "ville" varchar(255) NULL;',
      `COMMENT ON COLUMN "ecoles"."ville" IS 'Ville officielle de l''ecole.';`,
      'ALTER TABLE "ecoles" ADD COLUMN IF NOT EXISTS "commune_ou_territoire" varchar(255) NULL;',
      `COMMENT ON COLUMN "ecoles"."commune_ou_territoire" IS 'Commune ou territoire de l''ecole.';`,
    ];
  },

  genererSqlDescente(): readonly string[] {
    return [
      'ALTER TABLE "ecoles" DROP COLUMN IF EXISTS "commune_ou_territoire";',
      'ALTER TABLE "ecoles" DROP COLUMN IF EXISTS "ville";',
      'ALTER TABLE "ecoles" DROP COLUMN IF EXISTS "province_educationnelle";',
    ];
  },
};
