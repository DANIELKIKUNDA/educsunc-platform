// Cette migration declare les roles SECURITY.
export const createRolesTable = {
  nom: 'create_roles_table',
  sql: 'CREATE TABLE IF NOT EXISTS security_roles (...);',
};
