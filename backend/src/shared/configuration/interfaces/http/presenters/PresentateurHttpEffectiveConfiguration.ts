import type { EffectiveConfigurationDto } from '../../../../configuration/application';

// Ce fichier declare le presentateur HTTP de configuration effective.

export class PresentateurHttpEffectiveConfiguration {
  public static presenter(resultat: EffectiveConfigurationDto | null): EffectiveConfigurationDto | null {
    return resultat;
  }
}
