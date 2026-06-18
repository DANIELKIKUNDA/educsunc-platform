import type { MonitoringContextInputDto } from '../application';

// Ce fichier declare les types communs des workers Monitoring.

export type TypeWorkerMonitoring =
  | 'HEALTH'
  | 'ALERTS'
  | 'ALERTS_ESCALATION'
  | 'DIAGNOSTICS'
  | 'DIAGNOSTICS_FORENSIC'
  | 'CAPACITY'
  | 'SATURATION'
  | 'OBSERVABILITY'
  | 'SIGNALS'
  | 'TRACING'
  | 'TRACING_CORRELATION'
  | 'RETENTION';

export interface JobWorkerMonitoring<TPayload = unknown> {
  readonly type: TypeWorkerMonitoring;
  readonly contexte: MonitoringContextInputDto;
  readonly payload: TPayload;
}

export interface ResultatWorkerMonitoring<TResult = unknown> {
  readonly worker: TypeWorkerMonitoring;
  readonly succes: boolean;
  readonly resultat: TResult;
}
