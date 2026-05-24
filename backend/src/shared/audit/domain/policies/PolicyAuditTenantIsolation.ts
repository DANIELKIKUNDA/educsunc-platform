import { AuditTenantIsolationViolationException, AuditTenantMissingException } from '../exceptions';
import { TenantAudit } from '../entities';

// Cette policy protège l'isolation stricte des audits multi-tenant.
export class PolicyAuditTenantIsolation {
  public static verifier(tenantAudit: TenantAudit): void {
    const scope = tenantAudit.obtenirScope().obtenirValeur();
    if (scope === 'PLATEFORME') {
      return;
    }
    if (scope === 'ORGANISATION' && !tenantAudit.obtenirOrganisationId()) {
      throw new AuditTenantMissingException("Une entree audit d'organisation doit porter une organisation.");
    }
    if (scope === 'ECOLE' && (!tenantAudit.obtenirOrganisationId() || !tenantAudit.obtenirEcoleId())) {
      throw new AuditTenantIsolationViolationException("Une entree audit d'ecole doit porter l'organisation et l'ecole.");
    }
  }
}
