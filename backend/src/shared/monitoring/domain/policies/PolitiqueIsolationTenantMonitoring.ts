import { ExceptionCrossTenantMonitoring } from '../exceptions';
import { SpecificationIsolationTenantMonitoring } from '../specifications';
import { ContexteMonitoring } from '../value-objects';

// Ce fichier declare la politique d isolation tenant du domaine.

/** Cette classe represente la politique d isolation tenant Monitoring. */
export class PolitiqueIsolationTenantMonitoring {
  constructor(private readonly specification = new SpecificationIsolationTenantMonitoring()) {}

  /** Cette methode garantit la compatibilite tenant entre deux contextes. */
  public verifier(source: ContexteMonitoring, cible: ContexteMonitoring): void {
    if (!this.specification.estSatisfaite(source, cible)) {
      throw new ExceptionCrossTenantMonitoring();
    }
  }
}
