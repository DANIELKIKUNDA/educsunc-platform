import { TenantContextMiddleware as InfrastructureTenantContextMiddleware } from 'shared/auth/infrastructure/middlewares/TenantContextMiddleware';
import { TenantHeaders } from '../headers/TenantHeaders';

// Ce middleware HTTP valide le contexte tenant transporte dans la requete.
export class TenantMiddleware {
  constructor(private readonly tenantContextMiddleware: InfrastructureTenantContextMiddleware) {}

  // Cette methode relit les headers tenant et demande leur verification.
  public async verifier(headers: unknown): Promise<void> {
    await this.tenantContextMiddleware.verifier(TenantHeaders.extraire(headers));
  }
}
