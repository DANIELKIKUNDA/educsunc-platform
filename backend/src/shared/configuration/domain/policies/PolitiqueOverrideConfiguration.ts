import { ConfigurationScope } from '../value-objects';

// Ce fichier declare la politique de surcharge de configuration.

/** Cette classe centralise les regles d override autorise entre portees. */
export class PolitiqueOverrideConfiguration {
  /** Cette methode indique si une portee peut surcharger une portee source. */
  public autoriser(source: ConfigurationScope, cible: ConfigurationScope, verrouille: boolean): boolean {
    if (verrouille) {
      return false;
    }

    return cible.peutSurcharger(source);
  }
}
