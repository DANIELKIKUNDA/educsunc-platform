import { AuditEntry } from '../aggregates';

// Ce moteur prépare les informations minimales utiles aux enquêtes et analyses forensic.
export class MoteurForensicAudit {
  public extraireResume(entree: AuditEntry): Record<string, unknown> {
    return {
      idAuditEntry: entree.obtenirId(),
      acteur: entree.obtenirActeurAudit().obtenirNomAffichage(),
      action: entree.obtenirActionAudit().obtenirValeur(),
      requestId: entree.obtenirContexteAudit().obtenirRequestId()?.obtenirValeur(),
      correlationId: entree.obtenirAuditCorrelation()?.obtenirCorrelationId()?.obtenirValeur(),
      sourceRuntime: entree.obtenirContexteAudit().obtenirSourceRuntime().obtenirValeur(),
      tenantScope: entree.obtenirTenantAudit().obtenirScope().obtenirValeur(),
      organisationId: entree.obtenirTenantAudit().obtenirOrganisationId(),
      ecoleId: entree.obtenirTenantAudit().obtenirEcoleId(),
    };
  }
}
