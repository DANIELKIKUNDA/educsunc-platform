import type { RegisterSignalCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de signaux Monitoring.

export class WorkerSignalsMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: RegisterSignalCommand): Promise<ResultatWorkerMonitoring<void>> {
    await this.runtime.observability.signals.publier(commande);
    return {
      worker: 'SIGNALS',
      succes: true,
      resultat: undefined,
    };
  }
}
