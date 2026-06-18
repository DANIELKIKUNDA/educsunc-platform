import type {
  GetDashboardMonitoringUseCase,
  GetObservabilitySnapshotUseCase,
  GetSystemStateUseCase,
} from '../../../../monitoring/application';
import { PresentateurMonitoringHttp } from '../presenters';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP Monitoring global.

export class ControleurMonitoringHttp {
  constructor(
    private readonly getSystemStateUseCase: GetSystemStateUseCase,
    private readonly getDashboardMonitoringUseCase: GetDashboardMonitoringUseCase,
    private readonly getObservabilitySnapshotUseCase: GetObservabilitySnapshotUseCase,
  ) {}

  public async consulterEtat(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurMonitoringHttp.presenterEtat>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getSystemStateUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurMonitoringHttp.presenterEtat(resultat),
      contexte,
      commenceLe,
    );
  }

  public async consulterTableauBord(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurMonitoringHttp.presenterTableauBord>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getDashboardMonitoringUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurMonitoringHttp.presenterTableauBord(resultat),
      contexte,
      commenceLe,
    );
  }

  public async consulterObservabilite(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurMonitoringHttp.presenterObservabilite>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getObservabilitySnapshotUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurMonitoringHttp.presenterObservabilite(resultat),
      contexte,
      commenceLe,
    );
  }
}
