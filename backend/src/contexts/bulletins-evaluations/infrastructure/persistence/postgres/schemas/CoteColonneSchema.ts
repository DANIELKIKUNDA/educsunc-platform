// Ce fichier decrit le schema logique des colonnes de cotes rattachees a une fiche.
export const CoteColonneSchema = {
  table: 'cotes_colonnes_bulletin',
  colonnes: ['id', 'id_fiche_cotation', 'code_colonne', 'cote_obtenue', 'maximum_colonne', 'est_proclamee', 'date_encodage', 'encodee_par', 'modifiee_par', 'date_modification', 'est_echec', 'style_affichage'],
} as const;
