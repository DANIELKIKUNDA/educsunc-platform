import type { AuditAnalyticsSnapshot } from './AuditRepositoryTypes';

// Ce repository agrege les metriques et tableaux de bord d'audit.
export interface AuditAnalyticsRepository {
  calculerStatistiques(filtres: Record<string, unknown>): Promise<Record<string, unknown>>;
  calculerVolumetrieTenant(params: { organisationId?: string; ecoleId?: string }): Promise<Record<string, unknown>>;
  calculerActiviteUtilisateurs(filtres: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  enregistrerSnapshot?(snapshot: AuditAnalyticsSnapshot): Promise<void>;
  listerSnapshots?(filtres: { organisationId?: string; ecoleId?: string; dateReference?: string }): Promise<AuditAnalyticsSnapshot[]>;
}
