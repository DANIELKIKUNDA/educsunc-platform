// Ce fichier decrit la migration documentaire de creation des classements.
export const Migration_003_Classements = {
  nom: 'Migration_003_Classements',
  description: 'Creation des tables de classement des classes par colonne.',
  sql: [
    [
      'create table if not exists classements_colonnes_classes (',
      'id text primary key,',
      'id_ecole text not null,',
      'id_classe_pedagogique text not null,',
      'id_annee_scolaire text not null,',
      'code_colonne text not null,',
      'type_structure_evaluation text not null,',
      'date_calcul timestamptz not null,',
      'version integer not null,',
      "lignes_json jsonb not null default '[]'::jsonb",
      ')',
    ].join(' '),
    [
      'create unique index if not exists ux_classements_colonnes_classes_contexte',
      'on classements_colonnes_classes (id_classe_pedagogique, id_annee_scolaire, code_colonne)',
    ].join(' '),
  ],
} as const;
