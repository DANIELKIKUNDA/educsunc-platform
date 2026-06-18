import type { AlertDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP d alertes Monitoring.

export class PresentateurAlertesMonitoringHttp {
  public static presenter(resultat: AlertDto): AlertDto {
    return resultat;
  }

  public static presenterListe(resultat: readonly AlertDto[]): readonly AlertDto[] {
    return resultat;
  }
}
