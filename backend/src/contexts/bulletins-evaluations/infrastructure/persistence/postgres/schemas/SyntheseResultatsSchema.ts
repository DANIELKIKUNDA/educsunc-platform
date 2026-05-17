// Ce fichier decrit le schema logique de la table des syntheses de resultats.
export const SyntheseResultatsSchema = {
  table: 'syntheses_resultats_ecoles',
  colonnes: ['id', 'id_ecole', 'id_annee_scolaire', 'code_colonne', 'type_synthese', 'date_generation', 'generee_par', 'version'],
} as const;
