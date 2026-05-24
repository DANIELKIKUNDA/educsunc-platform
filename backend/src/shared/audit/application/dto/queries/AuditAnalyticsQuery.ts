// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditAnalyticsQuery {
  readonly periode?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly typeAuditPrincipal?: string;
}
