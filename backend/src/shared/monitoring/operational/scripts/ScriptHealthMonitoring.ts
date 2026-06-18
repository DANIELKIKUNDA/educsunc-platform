import { InitialiseurOperationalMonitoring } from '../bootstrap';

// Ce fichier declare le script operationnel de sante du module Monitoring.

export class ScriptHealthMonitoring {
  public async executer() {
    const operational = new InitialiseurOperationalMonitoring().initialiser();
    return operational.healthchecks.executer();
  }
}
