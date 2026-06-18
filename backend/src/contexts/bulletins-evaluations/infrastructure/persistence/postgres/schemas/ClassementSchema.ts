// Ce fichier decrit le schema logique de la table des classements de classe.
export const ClassementSchema = {
  table: 'classements_colonnes_classes',
  colonnes: [
    'id',
    'id_ecole',
    'id_classe_pedagogique',
    'id_annee_scolaire',
    'code_colonne',
    'type_structure_evaluation',
    'date_calcul',
    'version',
    'lignes_json',
  ],
} as const;
