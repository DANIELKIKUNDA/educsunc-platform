import { EffectiveValue } from '../value-objects';

// Ce fichier declare le service de resolution d heritage.

/** Cette classe centralise les explications de resolution d heritage. */
export class ServiceResolutionHeritageConfiguration {
  /** Cette methode retourne une explication lisible a partir d une valeur effective. */
  public expliquer(effectif: EffectiveValue): string {
    const details = effectif.details();
    return details.explanation;
  }
}
