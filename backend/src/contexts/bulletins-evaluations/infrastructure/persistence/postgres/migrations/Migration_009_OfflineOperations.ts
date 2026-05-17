// Ce fichier decrit la migration documentaire de creation des operations offline.
export const Migration_009_OfflineOperations = {
  nom: 'Migration_009_OfflineOperations',
  description: 'Creation des tables de synchronisation offline du BC.',
  sql: ['create table if not exists offline_operations_bulletins (...)'],
} as const;
