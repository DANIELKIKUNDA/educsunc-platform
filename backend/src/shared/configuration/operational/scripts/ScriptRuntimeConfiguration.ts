import { HealthcheckConfiguration } from '../health';
import { MonitoringOperationalConfiguration } from '../monitoring';

// Ce fichier declare un script local de synthese runtime.

export class ScriptRuntimeConfiguration {
  public executer() {
    return {
      health: new HealthcheckConfiguration().executer(),
      monitoring: new MonitoringOperationalConfiguration().executer(),
    };
  }
}
