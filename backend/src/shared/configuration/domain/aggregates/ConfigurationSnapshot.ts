import { EffectiveValue } from '../value-objects';

// Ce fichier declare l agregat de snapshot de configuration.

/** Cette classe represente un instantane immuable de valeurs effectives. */
export class ConfigurationSnapshot {
  constructor(
    private readonly identifiantSnapshot: string,
    private readonly valeurs: readonly EffectiveValue[],
    private readonly creeLe: Date = new Date(),
  ) {}

  /** Cette methode retourne la lecture brute du snapshot. */
  public details(): {
    readonly identifiantSnapshot: string;
    readonly valeurs: readonly ReturnType<EffectiveValue['details']>[];
    readonly creeLe: Date;
  } {
    return {
      identifiantSnapshot: this.identifiantSnapshot,
      valeurs: this.valeurs.map((valeur) => valeur.details()),
      creeLe: this.creeLe,
    };
  }
}
