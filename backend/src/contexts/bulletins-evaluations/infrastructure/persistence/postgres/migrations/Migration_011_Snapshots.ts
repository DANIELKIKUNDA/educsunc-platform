// Ce fichier decrit la migration documentaire de creation des snapshots de bulletins.
export const Migration_011_Snapshots = {
  nom: 'Migration_011_Snapshots',
  description: 'Creation de la table des snapshots techniques des bulletins.',
  sql: ['create table if not exists snapshots_bulletins (...)'],
} as const;
