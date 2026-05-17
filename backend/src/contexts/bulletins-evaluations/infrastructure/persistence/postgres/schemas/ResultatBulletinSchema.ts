// Ce fichier decrit le schema logique de la table des resultats consolides.
export const ResultatBulletinSchema = {
  table: 'resultats_bulletin_eleves',
  colonnes: ['id', 'id_eleve', 'id_inscription_scolaire', 'id_classe_pedagogique', 'id_annee_scolaire', 'version'],
} as const;
