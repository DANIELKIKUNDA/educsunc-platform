// Ce schema decrit la table technique des roles SECURITY.
export const rolesSchema = {
  table: 'security_roles',
  colonnes: ['id_role', 'code_role', 'nom_role', 'description', 'niveau_acces', 'est_systeme', 'est_actif', 'cree_le', 'cree_par', 'modifie_le', 'modifie_par', 'version'],
};
