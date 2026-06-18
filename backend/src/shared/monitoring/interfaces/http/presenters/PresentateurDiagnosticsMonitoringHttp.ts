import type { DiagnosticDto } from '../../../../monitoring/application';

// Ce fichier declare le presentateur HTTP de diagnostics Monitoring.

export class PresentateurDiagnosticsMonitoringHttp {
  public static presenter(resultat: DiagnosticDto): DiagnosticDto {
    return resultat;
  }

  public static presenterListe(resultat: readonly DiagnosticDto[]): readonly DiagnosticDto[] {
    return resultat;
  }
}
