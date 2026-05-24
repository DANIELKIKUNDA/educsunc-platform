// Ce DTO specialise les lectures analytiques du BC Audit.
export interface AuditExportAnalyticsInput {
  readonly id?: string;
  readonly payload?: Record<string, unknown>;
}
