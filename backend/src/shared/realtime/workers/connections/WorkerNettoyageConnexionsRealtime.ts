import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerNettoyageConnexionsRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(connexionIds: readonly string[]): ResultatWorkerRealtime {
    connexionIds.forEach((connexionId) => this.runtime.connections.registry.retirerConnexion(connexionId));
    return {
      worker: 'CONNECTIONS_CLEANUP',
      succes: true,
      resultat: {
        totalNettoye: connexionIds.length,
      },
    };
  }
}
