import type { HealthSnapshotDto, SystemStateDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP de sante Monitoring.

export class PresentateurHealthMonitoringHttp {
  public static presenterEtat(resultat: SystemStateDto): SystemStateDto {
    return resultat;
  }

  public static presenterSnapshot(resultat: HealthSnapshotDto): HealthSnapshotDto {
    return resultat;
  }
}
