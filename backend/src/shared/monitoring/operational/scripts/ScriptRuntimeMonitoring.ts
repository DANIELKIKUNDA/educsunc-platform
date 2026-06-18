import { InitialiseurOperationalMonitoring } from '../bootstrap';

// Ce fichier declare le script operationnel runtime du module Monitoring.

export class ScriptRuntimeMonitoring {
  public executer() {
    const operational = new InitialiseurOperationalMonitoring().initialiser();
    return operational.runtime.registry.snapshot();
  }
}
