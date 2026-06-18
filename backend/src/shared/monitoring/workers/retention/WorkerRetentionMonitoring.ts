import type { TraceDto } from '../../application';
import type { ResultatWorkerMonitoring } from '../TypesWorkersMonitoring';

// Ce fichier declare le worker de retention Monitoring.

export class WorkerRetentionMonitoring {
  public executer(traces: readonly TraceDto[], limite: number): ResultatWorkerMonitoring {
    const resultat = traces.slice(0, Math.max(0, limite));
    return {
      worker: 'RETENTION',
      succes: true,
      resultat,
    };
  }
}
