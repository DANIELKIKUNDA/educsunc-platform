// Ce fichier decrit le schema logique de la table des archives de bulletins.
export const ArchiveBulletinSchema = {
  table: 'archives_bulletins',
  colonnes: ['id', 'categorie_archive', 'reference_metier', 'chemin_archive', 'date_archivage'],
} as const;
