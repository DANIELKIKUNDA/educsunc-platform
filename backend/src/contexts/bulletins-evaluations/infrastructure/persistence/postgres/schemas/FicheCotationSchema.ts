// Ce fichier decrit le schema logique de la table des fiches de cotation.
export const FicheCotationSchema = {
  table: 'fiches_cotation_eleves_cours',
  colonnes: ['id', 'id_eleve', 'id_referentiel_cours', 'id_annee_scolaire', 'type_structure_evaluation', 'est_calculable', 'a_examen', 'version'],
} as const;
