import { InitialiseurOperationalRealtime } from '../bootstrap/InitialiseurOperationalRealtime';

export class ScriptRuntimeRealtime {
  public executer() {
    return new InitialiseurOperationalRealtime().initialiser().runtime.registry.snapshot();
  }
}
