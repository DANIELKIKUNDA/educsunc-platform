import type { AuditAnalyticsOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';

export class AuditAnalyticsPresenter {
  public static presenter(sortie: AuditAnalyticsOutput): AuditHttpSuccessBody<unknown> {
    return {
      success: true,
      data: {
        periode: sortie.periode,
        valeurs: sortie.valeurs,
        compteurs: sortie.compteurs ?? {},
      },
    };
  }
}
