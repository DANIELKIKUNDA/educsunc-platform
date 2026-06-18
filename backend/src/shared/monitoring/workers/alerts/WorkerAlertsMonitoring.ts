import type { CreateAlertCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker d alertes Monitoring.

export class WorkerAlertsMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: CreateAlertCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.alerts.global.declencher(commande);
    return {
      worker: 'ALERTS',
      succes: true,
      resultat,
    };
  }
}
