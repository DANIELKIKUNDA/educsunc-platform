import { ErreurColonneInterdite } from '../exceptions/ErreurColonneInterdite';

// Cette policy bloque toute colonne absente de la structure officielle applicable.
export class PolicyColonneInterdite {
  // Cette methode interdit l'utilisation d'une colonne non autorisee.
  public verifier(estAutorisee: boolean): void {
    if (!estAutorisee) {
      throw new ErreurColonneInterdite();
    }
  }
}
