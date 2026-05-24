// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditTimelineQuery {
  readonly correlationId?: string;
  readonly acteurId?: string;
  readonly ressourceId?: string;
  readonly workflowId?: string;
}
