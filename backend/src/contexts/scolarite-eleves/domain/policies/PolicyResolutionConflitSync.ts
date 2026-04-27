import { ErreurConcurrence } from '../exceptions/ErreurConcurrence';

// Ce fichier contient la regle de resolution des conflits de synchronisation.
/**
 * Cette policy exige une decision explicite quand deux modifications offline divergent.
 */
export class PolicyResolutionConflitSync {
  /** Refuse la synchronisation tant qu'un conflit n'a pas de decision explicite. */
  public verifierConflitResoluble(decisionResolutionPresente: boolean): void {
    if (!decisionResolutionPresente) {
      throw new ErreurConcurrence('Le conflit de synchronisation requiert une decision explicite.');
    }
  }
}
