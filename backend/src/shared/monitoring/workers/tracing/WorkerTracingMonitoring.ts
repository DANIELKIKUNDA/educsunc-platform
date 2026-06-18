import type { CaptureTraceCommand } from '../../application';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de tracing Monitoring.

export class WorkerTracingMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public async executer(commande: CaptureTraceCommand): Promise<ResultatWorkerMonitoring> {
    const resultat = await this.runtime.tracing.global.capturer(commande);
    return {
      worker: 'TRACING',
      succes: true,
      resultat,
    };
  }
}
