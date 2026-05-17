// Ce fichier decrit le schema logique des lignes detaillees d'un bulletin.
export const LigneBulletinSchema = {
  table: 'lignes_bulletins_eleves',
  colonnes: ['id', 'id_bulletin_eleve', 'id_referentiel_cours', 'libelle_cours', 'ordre_affichage', 'est_calculable', 'a_examen', 'cotes_colonnes', 'totaux_colonnes', 'styles_colonnes'],
} as const;
