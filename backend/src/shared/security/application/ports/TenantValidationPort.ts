export interface TenantValidationPort {
  verifierOrganisation(idOrganisation: string): Promise<boolean>;
  verifierEcole(idEcole: string): Promise<boolean>;
  verifierAppartenanceEcoleOrganisation(idEcole: string, idOrganisation: string): Promise<boolean>;
}
