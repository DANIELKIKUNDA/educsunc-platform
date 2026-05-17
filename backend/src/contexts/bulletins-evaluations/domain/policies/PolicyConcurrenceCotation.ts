import { ErreurConcurrenceDomaine } from '../exceptions/ErreurConcurrenceDomaine';

// Cette policy bloque tout ecrasement concurrent silencieux d'une cote.
export class PolicyConcurrenceCotation {
  // Cette methode compare la version attendue et la version actuelle.
  public verifier(versionAttendue: number, versionActuelle: number): void {
    if (versionAttendue !== versionActuelle) {
      throw new ErreurConcurrenceDomaine('La cote a ete modifiee par une autre operation concurrente.');
    }
  }
}
