import { TenantContextPort } from '../../application/ports/tenancy/TenantContextPort';

// Ce middleware technique verifie le contexte tenant actif transporte avec AUTH.
export class TenantContextMiddleware {
  constructor(private readonly tenantContextPort: TenantContextPort) {}

  public async verifier(params: { organisationActiveId?: string; ecoleActiveId?: string }): Promise<void> {
    await this.tenantContextPort.verifierContexteActif(params);
  }
}
