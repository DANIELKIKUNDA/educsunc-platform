import type { AuditOfflineStatusOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';

export class AuditSynchronizationPresenter {
  public static presenter(sortie: AuditOfflineStatusOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        total: sortie.total,
        synchronises: sortie.synchronises,
        enConflit: sortie.enConflit,
        enAttente: sortie.enAttente,
        auditId: sortie.auditId,
        statutSynchronisation: sortie.statutSynchronisation,
        replay: sortie.replay,
        retry: sortie.retry,
        conflit: sortie.conflit,
        horodatage: sortie.horodatage,
      },
    };
  }
}
