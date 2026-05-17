// Ce fichier decrit le schema logique de la table des proclamations.
export const ProclamationSchema = {
  table: 'proclamations_classes',
  colonnes: ['id', 'id_classe_pedagogique', 'id_annee_scolaire', 'code_colonne', 'type_proclamation', 'date_generation', 'generee_par', 'version'],
} as const;
