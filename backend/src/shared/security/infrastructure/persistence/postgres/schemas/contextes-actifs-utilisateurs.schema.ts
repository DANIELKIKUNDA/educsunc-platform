// Ce schema decrit la table des contextes actifs utilisateurs.
export const contextesActifsUtilisateursSchema = {
  table: 'security_contextes_actifs_utilisateurs',
  colonnes: ['id_contexte_actif_utilisateur', 'id_utilisateur', 'id_organisation_active', 'id_ecole_active', 'date_changement', 'version'],
};
