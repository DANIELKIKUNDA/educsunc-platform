// Ce fichier decrit la migration documentaire de creation des resultats consolides.
export const Migration_002_ResultatsBulletin = {
  nom: 'Migration_002_ResultatsBulletin',
  description: 'Creation des tables de resultats de bulletin et de colonnes consolidees.',
  sql: ['create table if not exists resultats_bulletin_eleves (...)'],
} as const;
