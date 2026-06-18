import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerMetriquesRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.observability.metriques.lire();
    return {
      worker: 'METRICS',
      succes: true,
      resultat,
    };
  }
}
