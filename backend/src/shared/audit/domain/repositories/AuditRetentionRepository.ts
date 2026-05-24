// Ce repository supporte la purge logique et le suivi de retention.
export interface AuditRetentionRepository {
  listerExpirables(reference: Date): Promise<string[]>;
  listerArchivables(reference: Date): Promise<string[]>;
  listerPurgeables(reference: Date): Promise<string[]>;
  lirePolitiquesRetention(): Promise<Record<string, unknown>[]>;
  calculerDureeVie?(params: { categorieAudit?: string; graviteAudit?: string }): Promise<number | null>;
}
