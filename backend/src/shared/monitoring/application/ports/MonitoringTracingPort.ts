import type { TraceOperation } from '../../domain';

// Ce fichier declare le port applicatif de gestion des traces.

/** Cette interface represente le pont vers les traces. */
export interface MonitoringTracingPort {
  enregistrerTrace(trace: TraceOperation): Promise<void>;
  retrouverTraces(ids?: readonly string[]): Promise<readonly TraceOperation[]>;
  listerTraces(): Promise<readonly TraceOperation[]>;
}
