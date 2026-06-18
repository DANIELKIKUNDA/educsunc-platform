import { TenantContext } from '../value-objects';

// Ce fichier declare la specification d isolation tenant.

/** Cette classe expose l isolation tenant sous forme de specification. */
export class SpecificationIsolationTenantConfiguration {
  /** Cette methode retourne vrai tant que deux contextes restent compatibles. */
  public estSatisfaitePar(courant: TenantContext, cible: TenantContext): boolean {
    try {
      courant.verifierCompatibilite(cible);
      return true;
    } catch {
      return false;
    }
  }
}
