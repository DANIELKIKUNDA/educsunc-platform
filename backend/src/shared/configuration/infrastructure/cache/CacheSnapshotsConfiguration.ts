import { ConfigurationSnapshotDto } from '../../application';
import { EntreeCacheConfiguration } from './TypesCacheConfiguration';

// Ce fichier declare le cache des snapshots.

/** Cette classe represente le cache local des snapshots de configuration. */
export class CacheSnapshotsConfiguration {
  private readonly cache = new Map<string, EntreeCacheConfiguration<ConfigurationSnapshotDto>>();

  constructor(private readonly ttlMillisecondes = 120_000) {}

  /** Cette methode memorise un snapshot applicatif. */
  public memoriser(cle: string, valeur: ConfigurationSnapshotDto): void {
    this.cache.set(cle, {
      cle,
      valeur,
      expireLe: new Date(Date.now() + this.ttlMillisecondes),
    });
  }

  /** Cette methode lit un snapshot si present et valide. */
  public lire(cle: string): ConfigurationSnapshotDto | null {
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
  public snapshot(): readonly EntreeCacheConfiguration<ConfigurationSnapshotDto>[] {
    return [...this.cache.values()];
  }
}
