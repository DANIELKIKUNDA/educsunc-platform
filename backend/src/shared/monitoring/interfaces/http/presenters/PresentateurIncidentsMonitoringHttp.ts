import type { IncidentDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP d incidents Monitoring.

export class PresentateurIncidentsMonitoringHttp {
  public static presenter(resultat: IncidentDto): IncidentDto {
    return resultat;
  }

  public static presenterListe(resultat: readonly IncidentDto[]): readonly IncidentDto[] {
    return resultat;
  }
}
