import type { TraceDto } from '../../application';
import { WorkerRetentionMonitoring } from '../../workers';
import type { PlanRetentionMonitoring } from './PlanRetentionMonitoring';

// Ce fichier declare la retention operationnelle du module Monitoring.

export class OperationalRetentionMonitoring {
  private readonly worker = new WorkerRetentionMonitoring();

  public planParDefaut(): PlanRetentionMonitoring {
    return {
      tracesJours: 15,
      diagnosticsJours: 90,
      forensicJours: 180,
    };
  }

  public executerRetention(traces: readonly TraceDto[], limite = 100) {
    return this.worker.executer(traces, limite);
  }
}
