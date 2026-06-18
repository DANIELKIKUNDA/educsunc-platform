import { InitialiseurOperationalRealtime } from '../bootstrap/InitialiseurOperationalRealtime';

export class ScriptConnexionsRealtime {
  public executer() {
    const operational = new InitialiseurOperationalRealtime().initialiser();
    return operational.healthchecks.executer().snapshotRuntime;
  }
}
