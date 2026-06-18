import { ContexteMonitoring } from '../value-objects';

// Ce fichier declare la specification d isolation tenant Monitoring.

/** Cette classe represente la specification d isolation tenant. */
export class SpecificationIsolationTenantMonitoring {
  /** Cette methode indique si deux contextes restent compatibles. */
  public estSatisfaite(source: ContexteMonitoring, cible: ContexteMonitoring): boolean {
    try {
      source.verifierCompatibilite(cible);
      return true;
    } catch {
      return false;
    }
  }
}
