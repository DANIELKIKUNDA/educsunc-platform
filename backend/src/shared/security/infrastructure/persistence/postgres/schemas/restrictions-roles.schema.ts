// Ce schema decrit la table des restrictions metier rattachees aux roles SECURITY.
export const restrictionsRolesSchema = {
  table: 'security_restrictions_roles',
  colonnes: ['id_restriction_role', 'id_role', 'code_restriction', 'description'],
};
