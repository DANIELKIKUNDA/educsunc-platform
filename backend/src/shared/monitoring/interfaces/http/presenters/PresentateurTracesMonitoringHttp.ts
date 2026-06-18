import type { TraceDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP de traces Monitoring.

export class PresentateurTracesMonitoringHttp {
  public static presenter(resultat: TraceDto): TraceDto {
    return resultat;
  }

  public static presenterListe(resultat: readonly TraceDto[]): readonly TraceDto[] {
    return resultat;
  }
}
