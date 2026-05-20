// Ce schema decrit la table technique des contextes actifs utilisateur.
export const contextesActifsAuthSchema = {
  table: 'auth_contextes_actifs',
  colonnes: ['id_contexte_actif_auth', 'id_utilisateur', 'organisation_active_id', 'ecole_active_id', 'dernier_changement_le', 'version'],
};
