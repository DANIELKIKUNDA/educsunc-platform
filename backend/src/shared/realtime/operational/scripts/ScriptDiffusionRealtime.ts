import { InitialiseurOperationalRealtime } from '../bootstrap/InitialiseurOperationalRealtime';

export class ScriptDiffusionRealtime {
  public executer() {
    const operational = new InitialiseurOperationalRealtime().initialiser();
    return operational.diagnostics.executer();
  }
}
