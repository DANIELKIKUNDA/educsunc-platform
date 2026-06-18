import type { GetObservabilitySnapshotQuery } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker d observabilite Monitoring.

export class WorkerObservabilityMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(query: GetObservabilitySnapshotQuery): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.observability.global.lire(query);
    return {
      worker: 'OBSERVABILITY',
      succes: true,
      resultat,
    };
  }
}
