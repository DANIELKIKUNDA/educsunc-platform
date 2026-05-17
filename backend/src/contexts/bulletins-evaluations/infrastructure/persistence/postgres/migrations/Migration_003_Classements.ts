// Ce fichier decrit la migration documentaire de creation des classements.
export const Migration_003_Classements = {
  nom: 'Migration_003_Classements',
  description: 'Creation des tables de classement des classes par colonne.',
  sql: ['create table if not exists classements_colonnes_classes (...)'],
} as const;
