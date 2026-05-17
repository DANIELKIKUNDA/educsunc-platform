// Ce fichier decrit le schema logique de la table des snapshots de bulletin.
export const SnapshotBulletinSchema = {
  table: 'snapshots_bulletins',
  colonnes: ['id', 'id_bulletin_eleve', 'date_snapshot', 'version_bulletin', 'projection_bulletin'],
} as const;
