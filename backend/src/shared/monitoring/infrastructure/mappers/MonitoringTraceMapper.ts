import type { TraceOperation } from '../../domain';

// Ce fichier declare le mapper de traces Monitoring.

/** Cette classe projette les traces en vues techniques. */
export class MonitoringTraceMapper {
  /** Cette methode projette une trace en vue persistable. */
  public versVue(trace: TraceOperation): ReturnType<TraceOperation['valeur']> {
    return trace.valeur();
  }
}
