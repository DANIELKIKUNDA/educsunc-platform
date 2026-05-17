// Ce fichier decrit la migration documentaire de creation des migrations de bulletin.
export const Migration_007_MigrationBulletin = {
  nom: 'Migration_007_MigrationBulletin',
  description: 'Creation des tables de suivi des migrations de bulletins.',
  sql: ['create table if not exists migrations_bulletins (...)'],
} as const;
