// Ce schema decrit la table des titulariats de classes.
export const affectationsTitulariatSchema = {
  table: 'security_affectations_titulariat',
  colonnes: ['id_affectation_titulariat', 'id_utilisateur', 'id_classe', 'id_annee_scolaire', 'est_actif', 'date_debut', 'date_fin', 'cree_le', 'cree_par', 'version'],
};
