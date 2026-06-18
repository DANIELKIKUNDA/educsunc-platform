import { ExceptionConfigurationIncoherente } from '../exceptions';

// Ce fichier declare la valeur metier d une configuration.

/** Cette union represente les formes serialisables acceptees par le domaine. */
export type ValeurConfigurationPrimitive = string | number | boolean | null;

/** Cette union represente les valeurs de configuration autorisees. */
export type ValeurConfiguration =
  | ValeurConfigurationPrimitive
  | readonly ValeurConfigurationPrimitive[]
  | Readonly<Record<string, ValeurConfigurationPrimitive>>;

/** Cette classe encapsule une valeur de configuration validee par le domaine. */
export class ConfigurationValue {
  private constructor(private readonly valeurInterne: ValeurConfiguration) {}

  /** Cette methode cree une valeur de configuration sous reserve de serialisabilite. */
  public static creer(valeur: ValeurConfiguration): ConfigurationValue {
    if (valeur === undefined) {
      throw new ExceptionConfigurationIncoherente(
        'Une valeur de configuration ne peut pas etre undefined.',
      );
    }
    return new ConfigurationValue(valeur);
  }

  /** Cette methode retourne la charge metier serialisable. */
  public valeur(): ValeurConfiguration {
    return this.valeurInterne;
  }
}
