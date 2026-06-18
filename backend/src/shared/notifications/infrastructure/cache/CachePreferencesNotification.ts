import { PreferencesNotification } from '../../domain';
import { IndexCachePreferencesNotification } from './TypesCacheNotification';

// Ce fichier implemente le cache des preferences Notifications.

/** Cette classe met en cache les preferences resolues des destinataires. */
export class CachePreferencesNotification {
  private readonly index: IndexCachePreferencesNotification = new Map();

  /** Ce constructeur fixe le TTL par defaut des preferences en cache. */
  constructor(private readonly ttlMs = 180_000) {}

  /** Cette methode enregistre des preferences dans le cache. */
  public enregistrer(destinataireId: string, preferences: PreferencesNotification): void {
    this.index.set(destinataireId, {
      cle: destinataireId,
      valeur: preferences,
      expireLe: new Date(Date.now() + this.ttlMs),
    });
  }

  /** Cette methode lit des preferences si l'entree est encore fraiche. */
  public lire(destinataireId: string): PreferencesNotification | null {
    const entree = this.index.get(destinataireId);
    if (!entree || entree.expireLe.getTime() <= Date.now()) {
      this.index.delete(destinataireId);
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide les preferences d'un destinataire. */
  public invalider(destinataireId: string): void {
    this.index.delete(destinataireId);
  }
}
