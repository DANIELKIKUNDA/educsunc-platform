// Ce DTO de sortie formalise une reponse applicative Audit.
export interface AuditAnalyticsOutput {
  readonly periode?: string;
  readonly valeurs: Record<string, number>;
  readonly compteurs?: Record<string, number>;
}
