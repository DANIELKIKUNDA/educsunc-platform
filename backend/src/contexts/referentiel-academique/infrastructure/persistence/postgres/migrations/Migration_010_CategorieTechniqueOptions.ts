import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute la categorie technique des options sans introduire de logique financiere.
export const migration010CategorieTechniqueOptions: MigrationPostgresReferentielAcademique = {
  idMigration: '010_categorie_technique_options',
  description: 'Ajout additif de la categorie technique des options d etude.',

  genererSqlMontee(): readonly string[] {
    return [
      'ALTER TABLE "options_etudes" ADD COLUMN IF NOT EXISTS "categorie_technique" varchar(20) NULL;',
      'COMMENT ON COLUMN "options_etudes"."categorie_technique" IS \'Categorie technique descriptive : GROUPE_1 ou GROUPE_2.\';',
      [
        'UPDATE "options_etudes"',
        'SET "categorie_technique" = CASE',
        'WHEN "est_technique" = false THEN NULL',
        'WHEN "code" IN (301, 302, 401, 501, 502, 503, 504, 505, 601, 701, 702, 703, 704) THEN \'GROUPE_1\'',
        'ELSE \'GROUPE_2\'',
        'END;',
      ].join(' '),
      [
        'DO $$ BEGIN',
        'IF NOT EXISTS (',
        'SELECT 1 FROM pg_constraint',
        "WHERE conname = 'ck_options_etudes_categorie_technique_valide'",
        ') THEN',
        'ALTER TABLE "options_etudes"',
        'ADD CONSTRAINT "ck_options_etudes_categorie_technique_valide"',
        'CHECK ("categorie_technique" IS NULL OR "categorie_technique" IN (\'GROUPE_1\', \'GROUPE_2\'));',
        'END IF;',
        'END $$;',
      ].join(' '),
      [
        'DO $$ BEGIN',
        'IF NOT EXISTS (',
        'SELECT 1 FROM pg_constraint',
        "WHERE conname = 'ck_options_etudes_technique_categorie_coherente'",
        ') THEN',
        'ALTER TABLE "options_etudes"',
        'ADD CONSTRAINT "ck_options_etudes_technique_categorie_coherente"',
        'CHECK (("est_technique" = false AND "categorie_technique" IS NULL) OR ("est_technique" = true AND "categorie_technique" IS NOT NULL));',
        'END IF;',
        'END $$;',
      ].join(' '),
    ];
  },

  genererSqlDescente(): readonly string[] {
    return [
      'ALTER TABLE "options_etudes" DROP CONSTRAINT IF EXISTS "ck_options_etudes_technique_categorie_coherente";',
      'ALTER TABLE "options_etudes" DROP CONSTRAINT IF EXISTS "ck_options_etudes_categorie_technique_valide";',
      'ALTER TABLE "options_etudes" DROP COLUMN IF EXISTS "categorie_technique";',
    ];
  },
};
