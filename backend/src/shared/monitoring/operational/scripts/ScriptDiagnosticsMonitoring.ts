import { InitialiseurOperationalMonitoring } from '../bootstrap';

// Ce fichier declare le script operationnel de diagnostics du module Monitoring.

export class ScriptDiagnosticsMonitoring {
  public async executer() {
    const operational = new InitialiseurOperationalMonitoring().initialiser();
    return operational.diagnostics.executer();
  }
}
