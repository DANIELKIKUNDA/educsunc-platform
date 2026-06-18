import type { TraceOperation } from '../../domain';
import { CorrelationTracesMonitoring } from '../../infrastructure';

// Ce fichier declare le runtime de correlation des traces.

export class RuntimeCorrelationTracingMonitoring {
  constructor(private readonly correlate = new CorrelationTracesMonitoring()) {}

  public regrouper(traces: readonly TraceOperation[]) {
    return this.correlate.regrouper(traces);
  }
}
