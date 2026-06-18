import { ConfigurationKey, ConfigurationValue } from '../value-objects';

// Ce fichier declare la politique de validation metier.

/** Cette classe centralise les controles de base sur les couples cle/valeur. */
export class PolitiqueValidationConfiguration {
  /** Cette methode retourne les avertissements associes a une configuration validee. */
  public valider(key: ConfigurationKey, value: ConfigurationValue): readonly string[] {
    const warnings: string[] = [];

    if (key.commencePar('runtime.') && typeof value.valeur() === 'string') {
      warnings.push('Les configurations runtime sont preferablement typées numeriques ou booleennes.');
    }

    if (key.commencePar('branding.logo') && value.valeur() === null) {
      warnings.push('Un branding sans logo principal explicite peut produire une experience de marque incomplete.');
    }

    return warnings;
  }
}
