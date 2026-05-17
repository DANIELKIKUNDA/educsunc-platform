// Ce fichier decrit le schema logique de la table des migrations de bulletin.
export const MigrationBulletinSchema = {
  table: 'migrations_bulletins',
  colonnes: ['id', 'id_classe_pedagogique', 'id_annee_scolaire', 'ancienne_version_referentiel', 'nouvelle_version_referentiel', 'statut_migration', 'version'],
} as const;
