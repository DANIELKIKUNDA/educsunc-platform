import type { MonitoringContextInputDto } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de sante Monitoring.

export class WorkerHealthMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(contexte: MonitoringContextInputDto): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.health.global.calculerEtat(contexte);
    return {
      worker: 'HEALTH',
      succes: true,
      resultat,
    };
  }
}
