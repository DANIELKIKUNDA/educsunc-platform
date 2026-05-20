// Ce schema decrit la table des scopes d'acces rattaches aux affectations SECURITY.
export const scopesAccesSchema = {
  table: 'security_scopes_acces',
  colonnes: ['id_scope_acces', 'id_affectation_utilisateur', 'type_scope', 'valeur_scope', 'est_lecture_seule'],
};
