import type { AuditTimelineQuery } from '../dto/queries/AuditTimelineQuery';
import type { AuditTimelineOutput } from '../dto/outputs/AuditTimelineOutput';
import type { AuditEntryOutput } from '../dto/outputs/AuditEntryOutput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditTimelineMapper {
  public static versTimelineOutput(query: AuditTimelineQuery, items: readonly AuditEntryOutput[]): AuditTimelineOutput {
    return {
      correlationId: query.correlationId,
      acteur: query.acteurId,
      ressource: query.ressourceId,
      timeline: items,
      items,
    };
  }
}
