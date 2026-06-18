import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerObservabiliteRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.observability.service.lire();
    return {
      worker: 'OBSERVABILITY',
      succes: true,
      resultat,
    };
  }
}
