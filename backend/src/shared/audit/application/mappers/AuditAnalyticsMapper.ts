import type { AuditAnalyticsQuery } from '../dto/queries/AuditAnalyticsQuery';
import type { AuditAnalyticsOutput } from '../dto/outputs/AuditAnalyticsOutput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditAnalyticsMapper {
  public static versAnalyticsOutput(query: AuditAnalyticsQuery, valeurs: Record<string, number>): AuditAnalyticsOutput {
    return {
      periode: query.periode,
      valeurs,
      compteurs: { ...valeurs },
    };
  }
}
