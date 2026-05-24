export interface MonitoringContext {
  readonly timings: {
    readonly requestStartedAt?: string;
    readonly requestFinishedAt?: string;
  };
  readonly metriques: Record<string, string | number | boolean>;
  readonly traces: readonly string[];
  readonly queueTimings: Record<string, number>;
  readonly workerTimings: Record<string, number>;
  readonly projectionTimings: Record<string, number>;
}

