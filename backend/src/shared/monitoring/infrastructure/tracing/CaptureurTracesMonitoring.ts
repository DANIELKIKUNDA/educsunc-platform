import type { MonitoringTracingPort } from '../../application';
import type { TraceOperation } from '../../domain';
import { RepositoryTraceMonitoringMemoire } from '../repositories';

// Ce fichier declare l adapter de capture de traces.

/** Cette classe represente l adapter technique de traces. */
export class CaptureurTracesMonitoring implements MonitoringTracingPort {
  constructor(private readonly repository = new RepositoryTraceMonitoringMemoire()) {}

  /** Cette methode persiste une trace capturee. */
  public async enregistrerTrace(trace: TraceOperation): Promise<void> {
    await this.repository.enregistrerTrace(trace);
  }

  /** Cette methode retrouve des traces par identifiants. */
  public async retrouverTraces(ids?: readonly string[]): Promise<readonly TraceOperation[]> {
    return this.repository.retrouverTraces(ids);
  }

  /** Cette methode liste les traces capturees. */
  public async listerTraces(): Promise<readonly TraceOperation[]> {
    return this.repository.listerTraces();
  }
}
