import type { TraceOperation } from '../../domain';
import { InitialiseurRuntimeMonitoring } from '../../runtime';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de correlation de traces Monitoring.

export class WorkerCorrelationTracingMonitoring {
  private readonly runtime = new InitialiseurRuntimeMonitoring().initialiser();

  public executer(traces: readonly TraceOperation[]): ResultatWorkerMonitoring {
    const resultat = this.runtime.tracing.correlation.regrouper(traces);
    return {
      worker: 'TRACING_CORRELATION',
      succes: true,
      resultat,
    };
  }
}
