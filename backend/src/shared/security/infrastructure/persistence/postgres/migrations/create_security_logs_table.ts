// Cette migration declare les journaux d'acces et de refus SECURITY.
export const createSecurityLogsTable = {
  nom: 'create_security_logs_table',
  sql: 'CREATE TABLE IF NOT EXISTS security_access_logs (...);',
};
