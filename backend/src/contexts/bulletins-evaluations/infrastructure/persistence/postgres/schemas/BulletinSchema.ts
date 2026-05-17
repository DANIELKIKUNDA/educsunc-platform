// Ce fichier decrit le schema logique de la table principale des bulletins.
export const BulletinSchema = {
  table: 'bulletins_eleves',
  colonnes: ['id', 'id_eleve', 'id_inscription_scolaire', 'id_classe_pedagogique', 'id_annee_scolaire', 'etat_bulletin', 'version_bulletin'],
} as const;
