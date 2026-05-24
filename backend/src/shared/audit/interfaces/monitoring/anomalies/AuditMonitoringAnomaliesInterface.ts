import type { AuditMonitoringAnomaliesDto } from '../dto';

export class AuditMonitoringAnomaliesInterface {
  public static creer(sortie?: Partial<AuditMonitoringAnomaliesDto>): AuditMonitoringAnomaliesDto {
    return {
      replayMassif: sortie?.replayMassif ?? 0,
      retryStorm: sortie?.retryStorm ?? 0,
      exportEnorme: sortie?.exportEnorme ?? 0,
      syncAnormale: sortie?.syncAnormale ?? 0,
      queueSaturation: sortie?.queueSaturation ?? 0,
      erreursRepetees: sortie?.erreursRepetees ?? 0,
    };
  }
}

