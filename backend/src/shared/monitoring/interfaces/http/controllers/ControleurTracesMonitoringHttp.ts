import type {
  CaptureTraceUseCase,
  GetTracesUseCase,
} from '../../../../monitoring/application';
import { PresentateurTracesMonitoringHttp } from '../presenters';
import { ValidateurHttpCaptureTrace } from '../validators';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP des traces Monitoring.

export class ControleurTracesMonitoringHttp {
  constructor(
    private readonly captureTraceUseCase: CaptureTraceUseCase,
    private readonly getTracesUseCase: GetTracesUseCase,
  ) {}

  public async capturer(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurTracesMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const payload = ValidateurHttpCaptureTrace.valider(requete.body);
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.captureTraceUseCase.executer({ ...payload, contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurTracesMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async lister(
    requete: RequeteHttpMonitoring<never, never, { correlationId?: string }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurTracesMonitoringHttp.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getTracesUseCase.executer({
      contexte,
      correlationId: requete.query?.correlationId,
    });
    return envelopperReponseHttpMonitoring(
      PresentateurTracesMonitoringHttp.presenterListe(resultat),
      contexte,
      commenceLe,
    );
  }
}
