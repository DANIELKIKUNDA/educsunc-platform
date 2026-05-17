import { ConcurrencyApplicationException } from '../exceptions/ConcurrencyApplicationException';
import type { ConcurrencyPort } from '../ports/out/ConcurrencyPort';

// Ce service centralise la validation applicative de concurrence optimiste.
export class ServiceValidationConcurrence {
  constructor(private readonly concurrencyPort?: ConcurrencyPort) {}

  // Cette methode verifie une version attendue et la traduit en erreur applicative claire.
  public verifier(versionAttendue: number, versionActuelle: number): void {
    try {
      this.concurrencyPort?.verifierVersion(versionAttendue, versionActuelle);
      if (this.concurrencyPort === undefined && versionAttendue !== versionActuelle) {
        throw new ConcurrencyApplicationException();
      }
    } catch (erreur) {
      if (erreur instanceof ConcurrencyApplicationException) {
        throw erreur;
      }

      throw new ConcurrencyApplicationException();
    }
  }
}
