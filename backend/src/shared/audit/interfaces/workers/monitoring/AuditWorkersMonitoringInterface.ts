import type { AuditWorkerMonitoringDto } from '../dto';
export class AuditWorkersMonitoringInterface {
  public static creer(): AuditWorkerMonitoringDto {
    return { throughput: 0, failures: 0, retries: 0, saturation: 0, queueLag: 0, timingsMs: 0 };
  }
}

