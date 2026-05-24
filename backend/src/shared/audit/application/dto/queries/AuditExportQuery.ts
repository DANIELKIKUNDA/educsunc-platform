// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditExportQuery {
  readonly format: string;
  readonly filtres?: Record<string, unknown>;
}
