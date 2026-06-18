import type { EscalateIncidentCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker d escalade d alertes/incidents.

export class WorkerEscalationAlertsMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: EscalateIncidentCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.alerts.escalation.escalader(commande);
    return {
      worker: 'ALERTS_ESCALATION',
      succes: true,
      resultat,
    };
  }
}
