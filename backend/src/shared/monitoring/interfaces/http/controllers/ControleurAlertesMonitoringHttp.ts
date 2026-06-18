import type {
  CreateAlertUseCase,
  GetAlertsUseCase,
  ResolveAlertUseCase,
} from '../../../../monitoring/application';
import { PresentateurAlertesMonitoringHttp } from '../presenters';
import { ValidateurHttpCreateAlert } from '../validators';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP des alertes Monitoring.

export class ControleurAlertesMonitoringHttp {
  constructor(
    private readonly createAlertUseCase: CreateAlertUseCase,
    private readonly resolveAlertUseCase: ResolveAlertUseCase,
    private readonly getAlertsUseCase: GetAlertsUseCase,
  ) {}

  public async creer(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurAlertesMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const payload = ValidateurHttpCreateAlert.valider(requete.body);
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.createAlertUseCase.executer({ ...payload, contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurAlertesMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async resoudre(
    requete: RequeteHttpMonitoring<{ resolvedAt?: Date }, { id?: string }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurAlertesMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.resolveAlertUseCase.executer({
      alertId: requete.params?.id ?? '',
      resolvedAt: requete.body?.resolvedAt,
    });
    return envelopperReponseHttpMonitoring(
      PresentateurAlertesMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async lister(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurAlertesMonitoringHttp.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getAlertsUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurAlertesMonitoringHttp.presenterListe(resultat),
      contexte,
      commenceLe,
    );
  }
}
