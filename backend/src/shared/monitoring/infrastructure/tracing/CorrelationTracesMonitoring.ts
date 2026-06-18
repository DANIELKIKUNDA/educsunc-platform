import { ServiceCorrelationTraces, type TraceOperation } from '../../domain';

// Ce fichier declare le service technique de correlation des traces.

/** Cette classe represente le correlateur technique de traces. */
export class CorrelationTracesMonitoring {
  constructor(private readonly service = new ServiceCorrelationTraces()) {}

  /** Cette methode regroupe des traces par correlation. */
  public regrouper(traces: readonly TraceOperation[]): Readonly<Record<string, readonly TraceOperation[]>> {
    return this.service.regrouper(traces);
  }
}
