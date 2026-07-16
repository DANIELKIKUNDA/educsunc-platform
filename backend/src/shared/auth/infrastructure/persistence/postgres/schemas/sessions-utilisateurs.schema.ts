// Ce schema decrit la table technique des sessions persistantes.
export const sessionsUtilisateursSchema = {
  table: 'auth_sessions_utilisateurs',
  colonnes: ['id_session_utilisateur', 'id_utilisateur', 'refresh_token_id', 'adresse_ip', 'user_agent', 'device_id', 'est_offline', 'revoquee_le', 'raison_revocation', 'dernier_refresh_le', 'organisation_active_id', 'ecole_active_id', 'cree_le', 'version'],
};
