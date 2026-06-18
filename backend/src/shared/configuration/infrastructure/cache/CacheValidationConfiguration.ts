import { ConfigurationValidationDto } from '../../application';
import { EntreeCacheConfiguration } from './TypesCacheConfiguration';

// Ce fichier declare le cache des validations.

/** Cette classe represente le cache local des validations de configuration. */
export class CacheValidationConfiguration {
  private readonly cache = new Map<string, EntreeCacheConfiguration<ConfigurationValidationDto>>();

  constructor(private readonly ttlMillisecondes = 45_000) {}

  /** Cette methode memorise un resultat de validation. */
  public memoriser(cle: string, valeur: ConfigurationValidationDto): void {
    this.cache.set(cle, {
      cle,
      valeur,
      expireLe: new Date(Date.now() + this.ttlMillisecondes),
    });
  }

  /** Cette methode lit une validation si presente et encore valide. */
  public lire(cle: string): ConfigurationValidationDto | null {
    const entree = this.cache.get(cle);
    if (!entree) {
      return null;
    }
    if (entree.expireLe.getTime() <= Date.now()) {
      this.cache.delete(cle);
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide une entree ou tout le cache. */
  public invalider(cle?: string): void {
    if (cle) {
      this.cache.delete(cle);
      return;
    }
    this.cache.clear();
  }

  /** Cette methode retourne l etat cache visible. */
  public snapshot(): readonly EntreeCacheConfiguration<ConfigurationValidationDto>[] {
    return [...this.cache.values()];
  }
}
