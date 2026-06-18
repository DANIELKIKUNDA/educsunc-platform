import { Alerte } from '../entities';
import { ExceptionAlerteInvalide } from '../exceptions';
import { SpecificationAlerteDeclenchable } from '../specifications';
import { SeuilAlerte } from '../value-objects';

// Ce fichier declare la politique de declenchement d une alerte.

/** Cette classe represente la politique de declenchement d alerte. */
export class PolitiqueDeclenchementAlerte {
  constructor(private readonly specification = new SpecificationAlerteDeclenchable()) {}

  /** Cette methode verifie qu une alerte peut etre declenchee. */
  public verifier(valeur: number, seuil: SeuilAlerte): void {
    if (!this.specification.estSatisfaite(valeur, seuil)) {
      throw new ExceptionAlerteInvalide('La valeur observee ne justifie pas le declenchement de cette alerte.');
    }
  }

  /** Cette methode indique si une alerte reste ouverte. */
  public estActive(alerte: Alerte): boolean {
    return alerte.valeur().statut !== 'RESOLVED' && alerte.valeur().statut !== 'SUPPRESSED';
  }
}
