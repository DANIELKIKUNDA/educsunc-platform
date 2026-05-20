// Ce schema decrit la table des permissions rattachees aux roles SECURITY.
export const permissionsRolesSchema = {
  table: 'security_permissions_roles',
  colonnes: ['id_permission_role', 'id_role', 'permission', 'cree_le', 'cree_par'],
};
