import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerHeartbeatRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.connections.heartbeat.battre();
    return {
      worker: 'HEARTBEAT',
      succes: true,
      resultat,
    };
  }
}
