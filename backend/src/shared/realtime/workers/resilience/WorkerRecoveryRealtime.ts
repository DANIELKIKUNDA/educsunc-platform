import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerRecoveryRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.resilience.recovery.relancer();
    return {
      worker: 'RECOVERY',
      succes: true,
      resultat,
    };
  }
}
