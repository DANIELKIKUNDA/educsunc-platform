// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface AuditExportQuery {
  readonly format: string;
  readonly filtres?: Record<string, unknown>;
  readonly demandeurId?: string;
  readonly scope?: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly categorieExport?: 'AUDIT' | 'FORENSIC' | 'ANALYTICS' | 'SECURITE';
  readonly idempotencyKey?: string;
}
