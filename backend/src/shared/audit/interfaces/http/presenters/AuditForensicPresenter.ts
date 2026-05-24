import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';
import { AuditPresenterSecurity } from './AuditPresenterSecurity';

export class AuditForensicPresenter {
  public static presenter(sortie: AuditForensicOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        investigationId: sortie.investigationId,
        resume: sortie.resume,
        correlations: sortie.correlations,
        timeline: (sortie.timeline ?? []).map((item) => AuditPresenterSecurity.masquerAuditEntry(item)),
        indicateurs: sortie.indicateurs ?? {},
      },
    };
  }
}
