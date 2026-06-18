import { SeuilAlerte } from '../value-objects';

// Ce fichier declare la specification de declenchement d une alerte.

/** Cette classe represente la specification de declenchement d une alerte. */
export class SpecificationAlerteDeclenchable {
  /** Cette methode indique si une valeur depasse un seuil. */
  public estSatisfaite(valeur: number, seuil: SeuilAlerte): boolean {
    return seuil.evaluer(valeur) !== null;
  }
}
