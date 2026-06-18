import { InitialiseurRuntimeRealtime } from '../../runtime';
import type { ResultatWorkerRealtime } from '../TypesWorkersRealtime';

export class WorkerProtectionTempeteRealtime {
  private readonly runtime = new InitialiseurRuntimeRealtime().initialiser();

  public executer(volume: number): ResultatWorkerRealtime {
    const resultat = this.runtime.resilience.protection.verifier(volume);
    return {
      worker: 'STORM_PROTECTION',
      succes: resultat,
      resultat,
    };
  }
}
