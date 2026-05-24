import type { AuditMonitoringAlertsDto } from '../dto';

export class AuditMonitoringAlertsInterface {
  public static creer(sortie?: Partial<AuditMonitoringAlertsDto>): AuditMonitoringAlertsDto {
    return {
      queuesBloquees: sortie?.queuesBloquees ?? 0,
      workersMorts: sortie?.workersMorts ?? 0,
      saturation: sortie?.saturation ?? 0,
      replayFailure: sortie?.replayFailure ?? 0,
      syncFailure: sortie?.syncFailure ?? 0,
      exportFailure: sortie?.exportFailure ?? 0,
    };
  }
}

