import { ErreurParcoursIncoherent } from '../exceptions/ErreurParcoursIncoherent';

// Ce fichier contient la regle d'immutabilite de l'historique.
/**
 * Cette policy interdit la suppression d'un evenement de parcours.
 */
export class PolicyHistoriqueImmuable {
  /** Refuse toute suppression d'evenement historique. */
  public verifierSuppressionEvenementInterdite(): never {
    throw new ErreurParcoursIncoherent('Un evenement historique ne peut pas etre supprime.');
  }
}
