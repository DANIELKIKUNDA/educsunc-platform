import type { AuditAnalyticsOutput, AuditSearchResultOutput } from 'shared/audit/application';
import type { AuditHttpSuccessBody } from './HttpAuditPresenterTypes';
import { AuditPresenter } from './AuditPresenter';

export class AuditRetentionPresenter {
  public static presenterStatut(sortie: AuditSearchResultOutput): AuditHttpSuccessBody<unknown> {
    return AuditPresenter.presenterListe(sortie);
  }

  public static presenterAction(sortie: AuditAnalyticsOutput): AuditHttpSuccessBody<unknown> {
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
