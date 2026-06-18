import type {
  CollectHealthSnapshotUseCase,
  GetSystemStateUseCase,
} from '../../../../monitoring/application';
import { PresentateurHealthMonitoringHttp } from '../presenters';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP de sante Monitoring.

export class ControleurHealthMonitoringHttp {
  constructor(
    private readonly getSystemStateUseCase: GetSystemStateUseCase,
    private readonly collectHealthSnapshotUseCase: CollectHealthSnapshotUseCase,
  ) {}

  public async consulterEtat(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurHealthMonitoringHttp.presenterEtat>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getSystemStateUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurHealthMonitoringHttp.presenterEtat(resultat),
      contexte,
      commenceLe,
    );
  }

  public async consulterSnapshot(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurHealthMonitoringHttp.presenterSnapshot>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.collectHealthSnapshotUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurHealthMonitoringHttp.presenterSnapshot(resultat),
      contexte,
      commenceLe,
    );
  }
}
