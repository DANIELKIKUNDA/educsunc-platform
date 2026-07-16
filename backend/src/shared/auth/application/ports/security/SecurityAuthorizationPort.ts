// Ce port relie AUTH au moteur de verification de scopes et de portees.
export interface SecurityAuthorizationPort {
  verifierScopes(utilisateurId: string): Promise<void>;
  verifierAccesOrganisation(utilisateurId: string, organisationActiveId: string): Promise<boolean>;
  verifierAccesEcole(utilisateurId: string, ecoleActiveId: string): Promise<boolean>;
  resoudreRoleActif?(utilisateurId: string): Promise<string | undefined>;
  resoudrePermissionsEffectives?(utilisateurId: string): Promise<readonly string[]>;
}
