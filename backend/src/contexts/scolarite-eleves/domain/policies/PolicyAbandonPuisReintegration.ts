import { ErreurTransitionStatutInterdite } from '../exceptions/ErreurTransitionStatutInterdite';
import { StatutEleve } from '../value-objects/StatutEleve';

// Ce fichier contient la regle de reintegration apres abandon.
/**
 * Cette policy exige une procedure explicite pour reactiver un eleve abandonne.
 */
export class PolicyAbandonPuisReintegration {
  /** Verifie qu'un eleve abandonne n'est reintegre que par une action explicite. */
  public verifierReintegrationExplicite(statutActuel: StatutEleve, reintegrationDemandee: boolean): void {
    if (statutActuel === StatutEleve.ABANDONNE && !reintegrationDemandee) {
      throw new ErreurTransitionStatutInterdite('Un eleve abandonne requiert une reintegration explicite.');
    }
  }
}
