// Ce fichier decrit le schema logique des lignes d'une proclamation.
export const LigneProclamationSchema = {
  table: 'lignes_proclamations_classes',
  colonnes: ['id', 'id_proclamation_classe', 'rang', 'id_eleve', 'nom_complet', 'sexe', 'total_obtenu', 'maximum_general', 'pourcentage', 'observation', 'statut_proclamation'],
} as const;
