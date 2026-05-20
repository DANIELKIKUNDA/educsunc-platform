// Ce port relie AUTH a la verification transverse du contexte tenant.
export interface TenantContextPort {
  verifierContexteActif(params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<void>;
  verifierCoherenceTenant(params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<boolean>;
}
