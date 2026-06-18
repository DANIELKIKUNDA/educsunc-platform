import type { DtoHttpMonitoringContext } from '../dto/inputs';

// Ce fichier declare le validateur HTTP de contexte Monitoring.

export class ValidateurHttpContexteMonitoring {
  public static valider(entree: unknown): DtoHttpMonitoringContext {
    return (entree ?? {}) as DtoHttpMonitoringContext;
  }
}
