import type {
  DashboardMonitoringDto,
  ObservabilitySnapshotDto,
  SystemStateDto,
} from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP Monitoring global.

export class PresentateurMonitoringHttp {
  public static presenterEtat(resultat: SystemStateDto): SystemStateDto {
    return resultat;
  }

  public static presenterTableauBord(resultat: DashboardMonitoringDto): DashboardMonitoringDto {
    return resultat;
  }

  public static presenterObservabilite(resultat: ObservabilitySnapshotDto): ObservabilitySnapshotDto {
    return resultat;
  }
}
