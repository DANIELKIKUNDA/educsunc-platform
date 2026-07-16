import { SecurityAuthorizationPort } from '../../../application/ports/security/SecurityAuthorizationPort';

type DependancesSecurityAuthorization = {
  verifierScopes?: (utilisateurId: string) => Promise<void>;
  verifierAccesOrganisation?: (utilisateurId: string, organisationActiveId: string) => Promise<boolean>;
  verifierAccesEcole?: (utilisateurId: string, ecoleActiveId: string) => Promise<boolean>;
  resoudreRoleActif?: (utilisateurId: string) => Promise<string | undefined>;
  resoudrePermissionsEffectives?: (utilisateurId: string) => Promise<readonly string[]>;
};

// Cet adaptateur relie AUTH a la couche SECURITY sans couplage fort.
export class SecurityAuthorizationAdapter implements SecurityAuthorizationPort {
  constructor(private readonly dependances: DependancesSecurityAuthorization = {}) {}

  public async verifierScopes(utilisateurId: string): Promise<void> {
    if (this.dependances.verifierScopes) {
      await this.dependances.verifierScopes(utilisateurId);
    }
  }

  public async verifierAccesOrganisation(utilisateurId: string, organisationActiveId: string): Promise<boolean> {
    if (this.dependances.verifierAccesOrganisation) {
      return this.dependances.verifierAccesOrganisation(utilisateurId, organisationActiveId);
    }

    return true;
  }

  public async verifierAccesEcole(utilisateurId: string, ecoleActiveId: string): Promise<boolean> {
    if (this.dependances.verifierAccesEcole) {
      return this.dependances.verifierAccesEcole(utilisateurId, ecoleActiveId);
    }

    return true;
  }

  public async resoudreRoleActif(utilisateurId: string): Promise<string | undefined> {
    return this.dependances.resoudreRoleActif?.(utilisateurId);
  }

  public async resoudrePermissionsEffectives(utilisateurId: string): Promise<readonly string[]> {
    return this.dependances.resoudrePermissionsEffectives?.(utilisateurId) ?? [];
  }
}
