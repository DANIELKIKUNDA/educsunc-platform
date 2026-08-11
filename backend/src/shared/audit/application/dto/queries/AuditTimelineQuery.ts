// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditTimelineQuery {
  readonly taillePage?: number;
  readonly cursor?: string;
  readonly correlationId?: string;
  readonly categorieAudit?: string;
  readonly acteurId?: string;
  readonly ressourceId?: string;
  readonly workflowId?: string;
  readonly dateDebut?: string;
  readonly dateFin?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
