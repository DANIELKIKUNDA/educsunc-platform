import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerReconnexionRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.offline.reconnexion.reevaluer();
    return {
      worker: 'RECONNECTION',
      succes: true,
      resultat,
    };
  }
}
