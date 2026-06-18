import { MigrationPostgresReferentielAcademique } from './MigrationPostgresReferentielAcademique';

// Cette migration ajoute la table des responsabilites de classes pedagogiques.
export const migration011ResponsabilitesClassesPedagogiques: MigrationPostgresReferentielAcademique = {
  idMigration: '011_responsabilites_classes_pedagogiques',
  description: 'Ajout des responsabilites de classes pedagogiques pour porter la verite primaire du responsable de classe.',

  genererSqlMontee(): readonly string[] {
    return [
      [
        'CREATE TABLE IF NOT EXISTS "responsabilites_classes_pedagogiques" (',
        '"id" uuid NOT NULL,',
        '"id_organisation" uuid NOT NULL,',
        '"id_ecole" uuid NOT NULL,',
        '"id_classe_pedagogique" uuid NOT NULL,',
        '"id_classe_academique" uuid NOT NULL,',
        '"id_section_scolaire" uuid NOT NULL,',
        '"id_annee_scolaire" uuid NOT NULL,',
        '"id_utilisateur_enseignant" varchar(120) NOT NULL,',
        '"active" boolean NOT NULL DEFAULT true,',
        '"date_debut" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,',
        '"date_fin" timestamptz NULL,',
        '"cree_le" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,',
        '"cree_par" varchar(120) NULL,',
        '"version" integer NOT NULL DEFAULT 1,',
        'CONSTRAINT "pk_responsabilites_classes_pedagogiques" PRIMARY KEY ("id"),',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_organisation" FOREIGN KEY ("id_organisation") REFERENCES "organisations"("id") ON UPDATE CASCADE ON DELETE RESTRICT,',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_ecole" FOREIGN KEY ("id_ecole") REFERENCES "ecoles"("id") ON UPDATE CASCADE ON DELETE RESTRICT,',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_classe_pedagogique" FOREIGN KEY ("id_classe_pedagogique") REFERENCES "classes_pedagogiques"("id") ON UPDATE CASCADE ON DELETE RESTRICT,',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_classe_academique" FOREIGN KEY ("id_classe_academique") REFERENCES "classes_academiques"("id") ON UPDATE CASCADE ON DELETE RESTRICT,',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_section" FOREIGN KEY ("id_section_scolaire") REFERENCES "sections_scolaires"("id") ON UPDATE CASCADE ON DELETE RESTRICT,',
        'CONSTRAINT "fk_responsabilites_classes_pedagogiques_annee" FOREIGN KEY ("id_annee_scolaire") REFERENCES "annees_scolaires"("id") ON UPDATE CASCADE ON DELETE RESTRICT',
        ');',
      ].join(' '),
      'CREATE UNIQUE INDEX IF NOT EXISTS "ux_responsabilites_classes_pedagogiques_active" ON "responsabilites_classes_pedagogiques" ("id_classe_pedagogique", "id_annee_scolaire") WHERE "active" = true;',
      'CREATE INDEX IF NOT EXISTS "ix_responsabilites_classes_pedagogiques_enseignant" ON "responsabilites_classes_pedagogiques" ("id_utilisateur_enseignant");',
      'CREATE INDEX IF NOT EXISTS "ix_responsabilites_classes_pedagogiques_ecole_annee" ON "responsabilites_classes_pedagogiques" ("id_ecole", "id_annee_scolaire");',
    ];
  },

  genererSqlDescente(): readonly string[] {
    return [
      'DROP INDEX IF EXISTS "ix_responsabilites_classes_pedagogiques_ecole_annee";',
      'DROP INDEX IF EXISTS "ix_responsabilites_classes_pedagogiques_enseignant";',
      'DROP INDEX IF EXISTS "ux_responsabilites_classes_pedagogiques_active";',
      'DROP TABLE IF EXISTS "responsabilites_classes_pedagogiques";',
    ];
  },
};
