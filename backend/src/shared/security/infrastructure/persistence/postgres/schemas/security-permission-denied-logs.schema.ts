// Ce schema decrit la table des refus de permissions SECURITY.
export const securityPermissionDeniedLogsSchema = {
  table: 'security_permission_denied_logs',
  colonnes: ['id_log', 'action', 'id_utilisateur', 'details', 'cree_le'],
};
