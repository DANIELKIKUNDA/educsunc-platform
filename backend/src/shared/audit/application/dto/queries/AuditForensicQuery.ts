// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditForensicQuery {
  readonly correlationId?: string;
  readonly incidentId?: string;
  readonly acteurId?: string;
  readonly adresseIp?: string;
}
