import type {
  GenerateDiagnosticUseCase,
  GetDiagnosticsUseCase,
} from '../../../../monitoring/application';
import { PresentateurDiagnosticsMonitoringHttp } from '../presenters';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP des diagnostics Monitoring.

export class ControleurDiagnosticsMonitoringHttp {
  constructor(
    private readonly generateDiagnosticUseCase: GenerateDiagnosticUseCase,
    private readonly getDiagnosticsUseCase: GetDiagnosticsUseCase,
  ) {}

  public async generer(
    requete: RequeteHttpMonitoring<{ traceIds?: readonly string[] }, { id?: string }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurDiagnosticsMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.generateDiagnosticUseCase.executer({
      incidentId: requete.params?.id ?? '',
      traceIds: requete.body?.traceIds,
    });
    return envelopperReponseHttpMonitoring(
      PresentateurDiagnosticsMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async lister(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurDiagnosticsMonitoringHttp.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getDiagnosticsUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurDiagnosticsMonitoringHttp.presenterListe(resultat),
      contexte,
      commenceLe,
    );
  }
}
