import type {
  EscalateIncidentUseCase,
  GetIncidentsUseCase,
  OpenIncidentUseCase,
} from '../../../../monitoring/application';
import { PresentateurIncidentsMonitoringHttp } from '../presenters';
import { ValidateurHttpOpenIncident } from '../validators';
import {
  envelopperReponseHttpMonitoring,
  extraireContexteHttpMonitoring,
} from './MonitoringControllerSupport';
import type {
  ReponseControleurHttpMonitoring,
  RequeteHttpMonitoring,
} from './HttpMonitoringControllerTypes';

// Ce fichier declare le controller HTTP des incidents Monitoring.

export class ControleurIncidentsMonitoringHttp {
  constructor(
    private readonly openIncidentUseCase: OpenIncidentUseCase,
    private readonly escalateIncidentUseCase: EscalateIncidentUseCase,
    private readonly getIncidentsUseCase: GetIncidentsUseCase,
  ) {}

  public async ouvrir(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurIncidentsMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const payload = ValidateurHttpOpenIncident.valider(requete.body);
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.openIncidentUseCase.executer({ ...payload, contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurIncidentsMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
      201,
    );
  }

  public async escalader(
    requete: RequeteHttpMonitoring<never, { id?: string }>,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurIncidentsMonitoringHttp.presenter>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.escalateIncidentUseCase.executer({
      incidentId: requete.params?.id ?? '',
    });
    return envelopperReponseHttpMonitoring(
      PresentateurIncidentsMonitoringHttp.presenter(resultat),
      contexte,
      commenceLe,
    );
  }

  public async lister(
    requete: RequeteHttpMonitoring,
  ): Promise<ReponseControleurHttpMonitoring<ReturnType<typeof PresentateurIncidentsMonitoringHttp.presenterListe>>> {
    const commenceLe = Date.now();
    const contexte = extraireContexteHttpMonitoring(requete);
    const resultat = await this.getIncidentsUseCase.executer({ contexte });
    return envelopperReponseHttpMonitoring(
      PresentateurIncidentsMonitoringHttp.presenterListe(resultat),
      contexte,
      commenceLe,
    );
  }
}
