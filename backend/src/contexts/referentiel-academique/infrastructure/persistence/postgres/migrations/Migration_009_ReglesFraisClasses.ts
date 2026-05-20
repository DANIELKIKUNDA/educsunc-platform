import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute les faits academiques exposes au BC Paiements pour les regles de frais.
export const migration009ReglesFraisClasses: MigrationPostgresReferentielAcademique = {
  idMigration: '009_regles_frais_classes',
  description: 'Ajout additif des faits de frais sur options et classes academiques.',

  genererSqlMontee(): readonly string[] {
    return [
      'ALTER TABLE "options_etudes" ADD COLUMN IF NOT EXISTS "est_technique" boolean NOT NULL DEFAULT false;',
      'ALTER TABLE "classes_academiques" ADD COLUMN IF NOT EXISTS "est_classe_tenasosp" boolean NOT NULL DEFAULT false;',
      'ALTER TABLE "classes_academiques" ADD COLUMN IF NOT EXISTS "est_classe_exetat" boolean NOT NULL DEFAULT false;',
      'ALTER TABLE "classes_academiques" ADD COLUMN IF NOT EXISTS "est_classe_finaliste" boolean NOT NULL DEFAULT false;',
      'COMMENT ON COLUMN "options_etudes"."est_technique" IS \'Indique si l option d etude correspond a une filiere technique.\';',
      'COMMENT ON COLUMN "classes_academiques"."est_classe_tenasosp" IS \'Indique si la classe est concernee par le TENASOSP.\';',
      'COMMENT ON COLUMN "classes_academiques"."est_classe_exetat" IS \'Indique si la classe est concernee par l EXETAT.\';',
      'COMMENT ON COLUMN "classes_academiques"."est_classe_finaliste" IS \'Indique si la classe est finaliste.\';',
      [
        'UPDATE "options_etudes"',
        'SET "est_technique" = CASE',
        'WHEN "code" IN (101, 102, 103, 104, 201, 202, 203, 204, 205) THEN false',
        'ELSE true',
        'END;',
      ].join(' '),
      [
        'DO $$ BEGIN',
        'IF NOT EXISTS (',
        'SELECT 1 FROM pg_constraint',
        "WHERE conname = 'ck_classes_academiques_exetat_finaliste'",
        ') THEN',
        'ALTER TABLE "classes_academiques"',
        'ADD CONSTRAINT "ck_classes_academiques_exetat_finaliste"',
        'CHECK ("est_classe_exetat" = false OR "est_classe_finaliste" = true);',
        'END IF;',
        'END $$;',
      ].join(' '),
      [
        'UPDATE "classes_academiques"',
        'SET "est_classe_tenasosp" = true',
        'WHERE upper("code") IN (\'7EB\', \'7E_EB\', \'7_EB\', \'8EB\', \'8E_EB\', \'8_EB\')',
        'OR upper("libelle") LIKE \'%7%EB%\'',
        'OR upper("libelle") LIKE \'%8%EB%\';',
      ].join(' '),
      [
        'UPDATE "classes_academiques"',
        'SET "est_classe_exetat" = true, "est_classe_finaliste" = true',
        'WHERE upper("cycle") LIKE \'%HUMAN%\'',
        'AND (upper("code") LIKE \'4%\' OR upper("libelle") LIKE \'%4%\');',
      ].join(' '),
    ];
  },

  genererSqlDescente(): readonly string[] {
    return [
      'ALTER TABLE "classes_academiques" DROP CONSTRAINT IF EXISTS "ck_classes_academiques_exetat_finaliste";',
      'ALTER TABLE "classes_academiques" DROP COLUMN IF EXISTS "est_classe_finaliste";',
      'ALTER TABLE "classes_academiques" DROP COLUMN IF EXISTS "est_classe_exetat";',
      'ALTER TABLE "classes_academiques" DROP COLUMN IF EXISTS "est_classe_tenasosp";',
      'ALTER TABLE "options_etudes" DROP COLUMN IF EXISTS "est_technique";',
    ];
  },
};
