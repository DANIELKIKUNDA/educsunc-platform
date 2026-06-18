import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerReplayLegerRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(): ResultatWorkerRealtime {
    const resultat = this.runtime.offline.replay.executer();
    return {
      worker: 'REPLAY_LEGER',
      succes: true,
      resultat,
    };
  }
}
