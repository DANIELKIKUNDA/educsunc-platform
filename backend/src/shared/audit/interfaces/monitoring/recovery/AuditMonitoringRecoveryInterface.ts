import type { AuditMonitoringRecoveryDto } from '../dto';

export class AuditMonitoringRecoveryInterface {
  public static creer(): AuditMonitoringRecoveryDto {
    return { relanceMonitoring: true };
  }
}

