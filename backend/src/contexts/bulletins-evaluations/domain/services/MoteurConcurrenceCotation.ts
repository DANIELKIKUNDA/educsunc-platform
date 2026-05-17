import { ErreurConcurrenceDomaine } from '../exceptions/ErreurConcurrenceDomaine';

// Ce moteur isole la verification de concurrence optimiste dans le domaine des cotes.
export class MoteurConcurrenceCotation {
  // Cette methode compare les versions attendue et actuelle avant mutation.
  public verifier(versionAttendue: number, versionActuelle: number): void {
    if (versionAttendue !== versionActuelle) {
      throw new ErreurConcurrenceDomaine('La fiche de cotation a deja ete modifiee par une autre operation.');
    }
  }
}
