import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute la classification officielle du bulletin sur les lignes de programme.
export const migration008AjoutClassificationLignesProgramme:
  MigrationPostgresReferentielAcademique = {
    idMigration: '008_ajout_classification_lignes_programme',
    description: 'Ajout additif des domaines et sous-domaines sur les lignes de programme.',

    genererSqlMontee(): readonly string[] {
      return [
        'ALTER TABLE "lignes_referentiel_programme" ADD COLUMN IF NOT EXISTS "domaine" varchar(160) NULL;',
        'ALTER TABLE "lignes_referentiel_programme" ADD COLUMN IF NOT EXISTS "sous_domaine" varchar(160) NULL;',
        'COMMENT ON COLUMN "lignes_referentiel_programme"."domaine" IS \'Domaine officiel du bulletin porte par la ligne de programme.\';',
        'COMMENT ON COLUMN "lignes_referentiel_programme"."sous_domaine" IS \'Sous-domaine officiel du bulletin porte par la ligne de programme.\';',
      ];
    },

    genererSqlDescente(): readonly string[] {
      return [
        'ALTER TABLE "lignes_referentiel_programme" DROP COLUMN IF EXISTS "sous_domaine";',
        'ALTER TABLE "lignes_referentiel_programme" DROP COLUMN IF EXISTS "domaine";',
      ];
    },
  };
