// Ce fichier decrit la migration documentaire de creation des archives de bulletins.
export const Migration_012_ArchivesBulletins = {
  nom: 'Migration_012_ArchivesBulletins',
  description: 'Creation de la table des archives de bulletins et de leurs exports.',
  sql: ['create table if not exists archives_bulletins (...)'],
} as const;
