import { RuntimeMonitoringInfrastructure } from './RuntimeMonitoringInfrastructure';

// Ce fichier declare le registre runtime de l infrastructure Monitoring.

/** Cette classe represente le registre runtime de l infrastructure Monitoring. */
export class RegistryRuntimeMonitoringInfrastructure {
  constructor(private readonly runtime = new RuntimeMonitoringInfrastructure()) {}

  /** Cette methode retourne le runtime courant. */
  public lireRuntime(): RuntimeMonitoringInfrastructure {
    return this.runtime;
  }
}
