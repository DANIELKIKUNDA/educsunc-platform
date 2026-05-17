import type { DiagnosticEchecReadModel } from 'contexts/bulletins-evaluations/application/read-models/DiagnosticEchecReadModel';

// Ce fichier prepare la projection documentaire des diagnostics d'echec.
export class DiagnosticProjectionHandler {
  // Cette methode retourne les diagnostics dans leur forme de lecture normalisee.
  public projeter(diagnostics: DiagnosticEchecReadModel[]): DiagnosticEchecReadModel[] {
    return [...diagnostics];
  }
}
