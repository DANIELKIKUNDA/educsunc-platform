import { ErreurTransitionStatutInterdite } from '../exceptions/ErreurTransitionStatutInterdite';
import { StatutEleve } from '../value-objects/StatutEleve';

// Ce fichier contient la regle de suspension administrative.
/**
 * Cette policy verifie qu'un eleve peut etre suspendu temporairement.
 */
export class PolicySuspensionEleve {
  /** Refuse la suspension d'un eleve deja sorti definitivement de l'activite. */
  public verifierSuspensionPossible(statutActuel: StatutEleve): void {
    if ([StatutEleve.DECEDE, StatutEleve.TRANSFERE, StatutEleve.ABANDONNE].includes(statutActuel)) {
      throw new ErreurTransitionStatutInterdite('Seul un eleve actif ou inactif peut etre suspendu.');
    }
  }
}
