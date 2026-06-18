import { DiagnosticConnexionsOperationalRealtime } from '../diagnostics/DiagnosticConnexionsOperationalRealtime';
import { InitialiseurOperationalRealtime } from '../bootstrap/InitialiseurOperationalRealtime';

export class ScriptDiagnosticsRealtime {
  public executer() {
    const operational = new InitialiseurOperationalRealtime().initialiser();
    return new DiagnosticConnexionsOperationalRealtime(operational.runtime).executer();
  }
}
