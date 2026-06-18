import type {
  CalculateCapacityUseCase,
  CalculateSaturationUseCase,
  GetCapacityUseCase,
} from '../../../../monitoring/application';
import { PresentateurCapaciteMonitoringHttp } from '../presenters';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP de capacite Monitoring.

export class ControleurCapaciteMonitoringHttp {
  constructor(
    private readonly calculateCapacityUseCase: CalculateCapacityUseCase,
    private readonly calculateSaturationUseCase: CalculateSaturationUseCase,
    private readonly getCapacityUseCase: GetCapacityUseCase,
  ) {}

  public async calculerCapacite(
    requete: RequeteHttpMonitoring<{ ressource: string; utilisationActuelle: number; capaciteMax: number; contexte?: unknown }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurCapaciteMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const body = requete.body!;
    const resultat = await this.calculateCapacityUseCase.executer({
      ressource: body.ressource,
      utilisationActuelle: body.utilisationActuelle,
      capaciteMax: body.capaciteMax,
      contexte,
    });
    return envelopperReponseHttpMonitoring(
      PresentateurCapaciteMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async calculerSaturation(
    requete: RequeteHttpMonitoring<{ ressource: string; taux: number; contexte?: unknown }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurCapaciteMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const body = requete.body!;
    const resultat = await this.calculateSaturationUseCase.executer({
      ressource: body.ressource,
      taux: body.taux,
      contexte,
    });
    return envelopperReponseHttpMonitoring(
      PresentateurCapaciteMonitoringHttp.presenter(resultat as never),
      contexte,
      commenceLe,
      201,
    );
  }

  public async lister(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurCapaciteMonitoringHttp.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getCapacityUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurCapaciteMonitoringHttp.presenterListe(resultat),
      contexte,
      commenceLe,
    );
  }
}
