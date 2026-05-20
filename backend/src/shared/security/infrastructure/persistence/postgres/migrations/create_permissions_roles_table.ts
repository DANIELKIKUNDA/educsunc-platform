// Cette migration declare les permissions des roles SECURITY.
export const createPermissionsRolesTable = {
  nom: 'create_permissions_roles_table',
  sql: 'CREATE TABLE IF NOT EXISTS security_permissions_roles (...);',
};
