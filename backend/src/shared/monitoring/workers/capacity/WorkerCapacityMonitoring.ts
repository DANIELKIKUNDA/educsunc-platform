import type { CalculateCapacityCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de capacite Monitoring.

export class WorkerCapacityMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: CalculateCapacityCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.capacity.global.calculer(commande);
    return {
      worker: 'CAPACITY',
      succes: true,
      resultat,
    };
  }
}
