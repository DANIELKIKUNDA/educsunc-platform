import { ErreurTransitionStatutInterdite } from '../exceptions/ErreurTransitionStatutInterdite';
import { StatutEleve } from '../value-objects/StatutEleve';

// Ce fichier contient la regle generale de transition de statut eleve.
/**
 * Cette policy empeche les transitions contradictoires ou impossibles.
 */
export class PolicyTransitionStatutEleve {
  /** Verifie qu'un changement de statut global est autorise. */
  public verifierTransitionAutorisee(statutActuel: StatutEleve, nouveauStatut: StatutEleve): void {
    if (statutActuel === StatutEleve.DECEDE && nouveauStatut !== StatutEleve.DECEDE) {
      throw new ErreurTransitionStatutInterdite('Un eleve decede ne peut pas revenir vers un autre statut.');
    }

    if (statutActuel === StatutEleve.TRANSFERE && nouveauStatut === StatutEleve.SUSPENDU) {
      throw new ErreurTransitionStatutInterdite('Un eleve transfere ne peut pas etre suspendu dans l ecole source.');
    }
  }
}
