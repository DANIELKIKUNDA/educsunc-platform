// Ce fichier decrit la migration documentaire de creation des fiches de cotation.
export const Migration_001_FichesCotation = {
  nom: 'Migration_001_FichesCotation',
  description: 'Creation des tables de fiches de cotation et de cotes par colonne.',
  sql: [
    'create table if not exists fiches_cotation_eleves_cours (...)',
    'create table if not exists cotes_colonnes_bulletin (...)',
  ],
} as const;
