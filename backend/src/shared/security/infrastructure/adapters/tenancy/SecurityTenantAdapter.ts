import type { TenantValidationPort } from '../../../application';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

type DependancesTenant = {
  verifierOrganisation?: (idOrganisation: string) => Promise<boolean>;
  verifierEcole?: (idEcole: string) => Promise<boolean>;
  verifierAppartenanceEcoleOrganisation?: (idEcole: string, idOrganisation: string) => Promise<boolean>;
};

// Cet adaptateur relie SECURITY au socle de tenancy sans lui faire porter la logique metier.
export class SecurityTenantAdapter implements TenantValidationPort {
  constructor(
    private readonly contexteTenant: ContexteTenant,
    private readonly dependances: DependancesTenant = {},
  ) {}

  public async verifierOrganisation(idOrganisation: string): Promise<boolean> {
    if (this.dependances.verifierOrganisation) {
      return this.dependances.verifierOrganisation(idOrganisation);
    }
    const courante = this.contexteTenant.obtenirOrganisation();
    return courante === null || courante === idOrganisation;
  }

  public async verifierEcole(idEcole: string): Promise<boolean> {
    try {
      return this.contexteTenant.obtenirTenant() === idEcole;
    } catch {
      if (this.dependances.verifierEcole) {
        return this.dependances.verifierEcole(idEcole);
      }
      return false;
    }
  }

  public async verifierAppartenanceEcoleOrganisation(idEcole: string, idOrganisation: string): Promise<boolean> {
    if (this.dependances.verifierAppartenanceEcoleOrganisation) {
      return this.dependances.verifierAppartenanceEcoleOrganisation(idEcole, idOrganisation);
    }
    const organisationCourante = this.contexteTenant.obtenirOrganisation();
    const ecoleCourante = this.contexteTenant.obtenirTenant();
    return organisationCourante === idOrganisation && ecoleCourante === idEcole;
  }
}
