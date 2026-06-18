import { TraceOperation } from '../entities';

// Ce fichier declare le service de correlation de traces.

/** Cette classe represente le service de correlation des traces. */
export class ServiceCorrelationTraces {
  /** Cette methode groupe les traces par correlation principale. */
  public regrouper(traces: readonly TraceOperation[]): Readonly<Record<string, readonly TraceOperation[]>> {
    const groupes = new Map<string, TraceOperation[]>();

    for (const trace of traces) {
      const correlationId = trace.valeur().correlation.correlationId;
      const groupe = groupes.get(correlationId) ?? [];
      groupe.push(trace);
      groupes.set(correlationId, groupe);
    }

    return Object.fromEntries(groupes.entries());
  }
}
