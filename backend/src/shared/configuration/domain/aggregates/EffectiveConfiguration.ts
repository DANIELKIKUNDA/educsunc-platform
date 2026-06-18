import { ConfigurationScope, EffectiveValue } from '../value-objects';

// Ce fichier declare l agregat de configuration effective.

/** Cette classe represente l etat effectif resolu pour une portee cible. */
export class EffectiveConfiguration {
  constructor(
    private readonly scope: ConfigurationScope,
    private readonly valeurs: readonly EffectiveValue[],
  ) {}

  /** Cette methode retourne la valeur effective d une cle si elle existe. */
  public lire(cle: string): EffectiveValue | null {
    return this.valeurs.find((valeur) => valeur.cle() === cle) ?? null;
  }

  /** Cette methode retourne une projection lisible de la configuration effective. */
  public details(): {
    readonly scope: ReturnType<ConfigurationScope['valeur']>;
    readonly valeurs: readonly ReturnType<EffectiveValue['details']>[];
  } {
    return {
      scope: this.scope.valeur(),
      valeurs: this.valeurs.map((valeur) => valeur.details()),
    };
  }
}
