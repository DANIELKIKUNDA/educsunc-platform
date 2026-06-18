import { DiagnosticIncident } from '../entities';

// Ce fichier declare la politique de generation de diagnostics.

/** Cette classe represente la politique de qualification des diagnostics. */
export class PolitiqueDiagnosticMonitoring {
  /** Cette methode indique si un diagnostic est actionnable. */
  public estActionnable(diagnostic: DiagnosticIncident): boolean {
    return diagnostic.valeur().recommandations.length > 0;
  }
}
