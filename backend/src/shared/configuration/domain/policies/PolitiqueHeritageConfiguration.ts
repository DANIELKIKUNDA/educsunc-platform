import { EffectiveValue } from '../value-objects';

// Ce fichier declare la politique d heritage.

/** Cette classe centralise la lecture metier de l heritage et de la provenance. */
export class PolitiqueHeritageConfiguration {
  /** Cette methode construit un message d explication de la valeur effective. */
  public expliquer(effectif: EffectiveValue): string {
    const details = effectif.details();
    return details.herite
      ? `Valeur heritee depuis le niveau ${details.sourceNiveau}.`
      : `Valeur definie explicitement au niveau ${details.sourceNiveau}.`;
  }
}
