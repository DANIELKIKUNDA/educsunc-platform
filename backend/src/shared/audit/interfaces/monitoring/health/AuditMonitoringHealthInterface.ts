import type { AuditMonitoringHealthDto } from '../dto';

export class AuditMonitoringHealthInterface {
  public static creer(sortie?: Partial<AuditMonitoringHealthDto>): AuditMonitoringHealthDto {
    return {
      db: sortie?.db ?? 'OK',
      queues: sortie?.queues ?? 'OK',
      workers: sortie?.workers ?? 'OK',
      syncEngine: sortie?.syncEngine ?? 'OK',
      projections: sortie?.projections ?? 'OK',
      exports: sortie?.exports ?? 'OK',
      eventBus: sortie?.eventBus ?? 'OK',
    };
  }
}

