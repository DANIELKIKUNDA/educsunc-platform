import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerDiagnosticsRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.observability.diagnostics.lire();
    return {
      worker: 'DIAGNOSTICS',
      succes: true,
      resultat,
    };
  }
}
