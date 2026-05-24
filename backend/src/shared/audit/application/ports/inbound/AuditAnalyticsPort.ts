// Ce port applicatif formalise une frontiere du BC Audit.
import type { AuditAnalyticsQuery } from '../../dto/queries';
import type { AuditAnalyticsOutput } from '../../dto/outputs';

// Ce port expose les lectures analytiques applicatives.
export interface AuditAnalyticsPort {
  obtenirStatistiquesAudit(input: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput>;
  obtenirVolumetrieAudit(input: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput>;
  obtenirStatistiquesSecurite(input: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput>;
  obtenirStatistiquesExports(input: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput>;
  obtenirStatistiquesSynchronisation(input: AuditAnalyticsQuery): Promise<AuditAnalyticsOutput>;
}
