import type { CalculateSaturationCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de saturation Monitoring.

export class WorkerSaturationMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: CalculateSaturationCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.capacity.saturation.calculer(commande);
    return {
      worker: 'SATURATION',
      succes: true,
      resultat,
    };
  }
}
