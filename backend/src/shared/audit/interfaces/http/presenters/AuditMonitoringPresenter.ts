import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';

export class AuditMonitoringPresenter {
  public static presenter(sortie: unknown): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: sortie,
    };
  }
}
