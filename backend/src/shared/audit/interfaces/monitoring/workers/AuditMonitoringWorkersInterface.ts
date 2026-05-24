import type { AuditMonitoringWorkerDto } from '../dto';

export class AuditMonitoringWorkersInterface {
  public static creer(sortie?: Partial<AuditMonitoringWorkerDto>): AuditMonitoringWorkerDto {
    return {
      actifs: sortie?.actifs ?? 0,
      echoues: sortie?.echoues ?? 0,
      retries: sortie?.retries ?? 0,
      crashes: sortie?.crashes ?? 0,
      throughput: sortie?.throughput ?? 0,
      tempsExecutionMs: sortie?.tempsExecutionMs ?? 0,
    };
  }
}

