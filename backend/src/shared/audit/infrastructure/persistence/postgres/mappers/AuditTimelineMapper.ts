import type { AuditTimelineOutput } from '../../../../application/dto/outputs/AuditTimelineOutput';
import type { AuditSearchResultOutput } from '../../../../application/dto/outputs/AuditSearchResultOutput';
import type { TimelineEventReadModel } from '../../../../application/read-models/timeline/TimelineEventReadModel';
import type { AuditEntryOutput } from '../../../../application/dto/outputs/AuditEntryOutput';

// Ce mapper preserve l'ordre chronologique exact des timelines, meme avec offline/replay/retry.
export class AuditTimelineMapper {
  public static trierEvenements<TEvenement extends { dateAction?: string }>(evenements: readonly TEvenement[]): TEvenement[] {
    return [...evenements].sort((a, b) => (a.dateAction ?? '').localeCompare(b.dateAction ?? ''));
  }

  public static versReadModels(items: readonly AuditEntryOutput[]): TimelineEventReadModel[] {
    return this.trierEvenements(items).map((item) => ({
      idAuditEntry: item.idAuditEntry,
      action: item.action,
      dateAction: item.dateAction,
      resultat: item.resultat,
    }));
  }

  public static versTimelineOutput(items: readonly AuditEntryOutput[], correlationId?: string): AuditTimelineOutput {
    const timeline = this.trierEvenements(items);
    return {
      correlationId,
      timeline,
      items: timeline,
    };
  }

  public static versSearchOutput(items: readonly AuditEntryOutput[]): AuditSearchResultOutput {
    const tries = this.trierEvenements(items);
    return {
      total: tries.length,
      page: 1,
      taillePage: tries.length,
      totalPages: tries.length > 0 ? 1 : 0,
      items: tries,
      pagination: {
        page: 1,
        taille: tries.length,
        total: tries.length,
        totalPages: tries.length > 0 ? 1 : 0,
      },
    };
  }
}
