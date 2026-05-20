// Ce schema decrit la table des affectations utilisateurs SECURITY.
export const affectationsUtilisateursSchema = {
  table: 'security_affectations_utilisateurs',
  colonnes: ['id_affectation_utilisateur', 'id_utilisateur', 'id_role', 'niveau_acces', 'id_organisation', 'id_ecole', 'id_section', 'id_classe', 'id_cours', 'etat_affectation', 'date_debut', 'date_fin', 'cree_le', 'cree_par', 'version'],
};
