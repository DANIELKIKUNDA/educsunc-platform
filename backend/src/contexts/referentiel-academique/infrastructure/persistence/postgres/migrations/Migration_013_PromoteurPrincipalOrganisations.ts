import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute les colonnes de promoteur principal sur les organisations deja existantes.
export const migration013PromoteurPrincipalOrganisations: MigrationPostgresReferentielAcademique = {
  idMigration: '013_promoteur_principal_organisations',
  description: "Ajout des colonnes de promoteur principal sur les organisations pour porter le proprietaire metier sans casser l'audit createur.",

  genererSqlMontee(): readonly string[] {
    return [
      'ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "promoteur_principal_utilisateur_id" varchar(120) NULL;',
      `COMMENT ON COLUMN "organisations"."promoteur_principal_utilisateur_id" IS 'Identifiant utilisateur AUTH du promoteur principal rattache a l''organisation.';`,
      'ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "promoteur_principal_nom_complet" varchar(255) NULL;',
      `COMMENT ON COLUMN "organisations"."promoteur_principal_nom_complet" IS 'Nom complet affiche du promoteur principal.';`,
      'ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "promoteur_principal_email" varchar(255) NULL;',
      `COMMENT ON COLUMN "organisations"."promoteur_principal_email" IS 'Adresse email du promoteur principal.';`,
      'ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "promoteur_principal_telephone" varchar(60) NULL;',
      `COMMENT ON COLUMN "organisations"."promoteur_principal_telephone" IS 'Telephone du promoteur principal.';`,
      'ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "promoteur_principal_identifiant" varchar(120) NULL;',
      `COMMENT ON COLUMN "organisations"."promoteur_principal_identifiant" IS 'Identifiant metier ou alias du promoteur principal s''il existe.';`,
    ];
  },

  genererSqlDescente(): readonly string[] {
    return [
      'ALTER TABLE "organisations" DROP COLUMN IF EXISTS "promoteur_principal_identifiant";',
      'ALTER TABLE "organisations" DROP COLUMN IF EXISTS "promoteur_principal_telephone";',
      'ALTER TABLE "organisations" DROP COLUMN IF EXISTS "promoteur_principal_email";',
      'ALTER TABLE "organisations" DROP COLUMN IF EXISTS "promoteur_principal_nom_complet";',
      'ALTER TABLE "organisations" DROP COLUMN IF EXISTS "promoteur_principal_utilisateur_id";',
    ];
  },
};
