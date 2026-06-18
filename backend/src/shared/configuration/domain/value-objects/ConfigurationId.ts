import { randomUUID } from 'node:crypto';
import { ExceptionConfigurationIncoherente } from '../exceptions';

// Ce fichier declare l identifiant metier d une configuration.

/** Cette classe represente l identifiant stable d une configuration gouvernee. */
export class ConfigurationId {
  private constructor(private readonly valeurInterne: string) {}

  /** Cette methode cree un identifiant a partir d une valeur explicite ou generee. */
  public static creer(valeur?: string): ConfigurationId {
    const identifiant = (valeur ?? randomUUID()).trim();
    if (identifiant.length === 0) {
      throw new ExceptionConfigurationIncoherente('Un identifiant de configuration ne peut pas etre vide.');
    }
    return new ConfigurationId(identifiant);
  }

  /** Cette methode retourne la valeur texte brute de l identifiant. */
  public valeur(): string {
    return this.valeurInterne;
  }
}
