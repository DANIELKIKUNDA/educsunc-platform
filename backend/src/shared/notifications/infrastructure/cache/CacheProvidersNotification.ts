import { ProviderNotificationTechnique } from '../providers';
import { EntreeCacheNotification, IndexCacheProvidersNotification } from './TypesCacheNotification';

// Ce fichier implemente le cache des providers Notifications.

/** Cette classe met en cache la resolution des providers par canal. */
export class CacheProvidersNotification {
  private readonly index: IndexCacheProvidersNotification = new Map();

  /** Ce constructeur fixe le TTL par defaut des providers en cache. */
  constructor(private readonly ttlMs = 120_000) {}

  /** Cette methode enregistre un provider dans le cache. */
  public enregistrer(cle: string, provider: ProviderNotificationTechnique): void {
    this.index.set(cle, {
      cle,
      valeur: provider,
      expireLe: new Date(Date.now() + this.ttlMs),
    });
  }

  /** Cette methode lit un provider si l'entree est encore fraiche. */
  public lire(cle: string): ProviderNotificationTechnique | null {
    const entree = this.index.get(cle);
    if (!entree || this.estExpiree(entree)) {
      this.index.delete(cle);
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide le cache d'un provider resolu. */
  public invalider(cle: string): void {
    this.index.delete(cle);
  }

  /** Cette methode detecte si une entree de cache a expire. */
  private estExpiree(entree: EntreeCacheNotification<ProviderNotificationTechnique>): boolean {
    return entree.expireLe.getTime() <= Date.now();
  }
}
