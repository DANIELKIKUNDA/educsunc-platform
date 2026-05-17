import { ErreurCoteHorsMaximum } from '../exceptions/ErreurCoteHorsMaximum';

// Cette policy garantit qu'une cote ne depasse jamais le maximum officiel.
export class PolicyMaximumOfficiel {
  // Cette methode verifie qu'une cote eventuelle reste dans ses bornes.
  public verifier(cote: number | null | undefined, maximum: number): void {
    if (cote === undefined || cote === null) {
      return;
    }

    if (cote > maximum) {
      throw new ErreurCoteHorsMaximum();
    }
  }
}
