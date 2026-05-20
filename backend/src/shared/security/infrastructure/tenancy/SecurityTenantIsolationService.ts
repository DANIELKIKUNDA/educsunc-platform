import { PolicyIsolationTenant } from '../../domain';

// Ce service applique les controles techniques de separation tenant a SECURITY.
export class SecurityTenantIsolationService {
  public verifierOrganisation(idOrganisationDemandee?: string, organisationActiveId?: string): void {
    if (idOrganisationDemandee && organisationActiveId && idOrganisationDemandee !== organisationActiveId) {
      throw new Error("L'organisation demandee n'est pas autorisee.");
    }
  }

  public verifierEcole(idEcoleDemandee?: string, ecoleActiveId?: string): void {
    if (idEcoleDemandee && ecoleActiveId && idEcoleDemandee !== ecoleActiveId) {
      throw new Error("L'ecole demandee n'est pas autorisee.");
    }
  }

  public verifierCohorenceTenant(idOrganisationActive?: string, idEcoleActive?: string, coherence = true): void {
    PolicyIsolationTenant.verifier(idOrganisationActive, idEcoleActive, coherence);
  }
}
