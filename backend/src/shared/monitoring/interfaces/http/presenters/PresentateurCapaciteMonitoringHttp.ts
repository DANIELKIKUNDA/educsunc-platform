import type { CapacityDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP de capacite Monitoring.

export class PresentateurCapaciteMonitoringHttp {
  public static presenter(resultat: CapacityDto): CapacityDto {
    return resultat;
  }

  public static presenterListe(resultat: readonly CapacityDto[]): readonly CapacityDto[] {
    return resultat;
  }
}
