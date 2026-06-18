import { ExceptionConfigurationIncoherente } from '../exceptions';

// Ce fichier declare la cle metier d une configuration.

/** Cette classe represente une cle de configuration gouvernee et validee. */
export class ConfigurationKey {
  private constructor(private readonly valeurInterne: string) {}

  /** Cette methode cree une cle normalisee a partir d une notation pointee. */
  public static creer(valeur: string): ConfigurationKey {
    const normalisee = valeur.trim();
    if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/u.test(normalisee)) {
      throw new ExceptionConfigurationIncoherente(
        'La cle de configuration doit suivre une notation alphanumerique simple.',
      );
    }
    return new ConfigurationKey(normalisee);
  }

  /** Cette methode retourne la valeur texte de la cle. */
  public valeur(): string {
    return this.valeurInterne;
  }

  /** Cette methode indique si la cle appartient a une famille donnee. */
  public commencePar(prefixe: string): boolean {
    return this.valeurInterne.startsWith(prefixe);
  }
}
