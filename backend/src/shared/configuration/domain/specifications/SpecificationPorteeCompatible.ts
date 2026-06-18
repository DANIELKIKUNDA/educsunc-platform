import { ConfigurationScope } from '../value-objects';

// Ce fichier declare la specification de compatibilite de portee.

/** Cette classe indique si deux portees peuvent coexister dans la meme resolution. */
export class SpecificationPorteeCompatible {
  /** Cette methode verifie la compatibilite entre une portee source et une portee cible. */
  public estSatisfaitePar(source: ConfigurationScope, cible: ConfigurationScope): boolean {
    const sourceValeur = source.valeur();
    const cibleValeur = cible.valeur();

    if (
      sourceValeur.organisationId
      && cibleValeur.organisationId
      && sourceValeur.organisationId !== cibleValeur.organisationId
    ) {
      return false;
    }

    if (sourceValeur.ecoleId && cibleValeur.ecoleId && sourceValeur.ecoleId !== cibleValeur.ecoleId) {
      return false;
    }

    return true;
  }
}
