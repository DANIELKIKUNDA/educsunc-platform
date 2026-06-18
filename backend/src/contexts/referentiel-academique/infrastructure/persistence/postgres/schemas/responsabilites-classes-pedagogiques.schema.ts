// Ce schema decrit la table locale des responsabilites de classes pedagogiques.
export const responsabilitesClassesPedagogiquesSchema = {
  table: 'responsabilites_classes_pedagogiques',
  colonnes: [
    'id',
    'id_organisation',
    'id_ecole',
    'id_classe_pedagogique',
    'id_classe_academique',
    'id_section_scolaire',
    'id_annee_scolaire',
    'id_utilisateur_enseignant',
    'active',
    'date_debut',
    'date_fin',
    'cree_le',
    'cree_par',
    'version',
  ],
};
