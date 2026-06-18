import type { TraceDto } from '../../application';

// Ce fichier declare le runtime de sampling de traces.

export class RuntimeSamplingTracingMonitoring {
  public echantillonner(traces: readonly TraceDto[], taille: number): readonly TraceDto[] {
    return traces.slice(0, Math.max(0, taille));
  }
}
