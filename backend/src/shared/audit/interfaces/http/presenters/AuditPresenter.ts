import type { AuditEntryOutput, AuditSearchResultOutput, AuditTimelineOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';
import { AuditPresenterSecurity } from './AuditPresenterSecurity';

export class AuditPresenter {
  public static presenterListe(sortie: AuditSearchResultOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        total: sortie.total,
        items: sortie.items.map((item) => AuditPresenterSecurity.masquerAuditEntry(item)),
        pagination: sortie.pagination,
      },
    };
  }

  public static presenterDetail(sortie: AuditEntryOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: AuditPresenterSecurity.masquerAuditEntry(sortie),
    };
  }

  public static presenterTimeline(sortie: AuditTimelineOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        correlationId: sortie.correlationId,
        acteur: sortie.acteur,
        ressource: sortie.ressource,
        timeline: sortie.timeline.map((item) => AuditPresenterSecurity.masquerAuditEntry(item)),
      },
    };
  }
}
