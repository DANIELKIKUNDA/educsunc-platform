import { DiagnosticOperationalConfiguration } from '../diagnostics';

// Ce fichier declare un script local de diagnostic.

export class ScriptDiagnosticConfiguration {
  public executer() {
    return new DiagnosticOperationalConfiguration().executer();
  }
}
