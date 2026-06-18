import { EffectiveConfigurationDto } from '../../application';
import { EntreeCacheConfiguration } from './TypesCacheConfiguration';

// Ce fichier declare le cache de configuration effective.

/** Cette classe represente le cache local des configurations effectives. */
export class CacheConfigurationEffective {
  private readonly cache = new Map<string, EntreeCacheConfiguration<EffectiveConfigurationDto>>();

  constructor(private readonly ttlMillisecondes = 60_000) {}

  /** Cette methode memorise une configuration effective. */
  public memoriser(cle: string, valeur: EffectiveConfigurationDto): void {
    this.cache.set(cle, {
      cle,
      valeur,
      expireLe: new Date(Date.now() + this.ttlMillisecondes),
    });
  }

  /** Cette methode lit une configuration effective si elle est encore valide. */
  public lire(cle: string): EffectiveConfigurationDto | null {
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
  public snapshot(): readonly EntreeCacheConfiguration<EffectiveConfigurationDto>[] {
    return [...this.cache.values()];
  }
}
