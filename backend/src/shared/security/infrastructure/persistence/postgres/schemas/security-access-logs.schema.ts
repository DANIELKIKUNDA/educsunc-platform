// Ce schema decrit la table des journaux d'acces SECURITY.
export const securityAccessLogsSchema = {
  table: 'security_access_logs',
  colonnes: ['id_log', 'action', 'id_utilisateur', 'succes', 'details', 'cree_le'],
};
