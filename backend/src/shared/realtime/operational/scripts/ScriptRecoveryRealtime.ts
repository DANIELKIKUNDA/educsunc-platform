import { InitialiseurOperationalRealtime } from '../bootstrap/InitialiseurOperationalRealtime';

export class ScriptRecoveryRealtime {
  public executer() {
    const operational = new InitialiseurOperationalRealtime().initialiser();
    return operational.recovery.executer();
  }
}
