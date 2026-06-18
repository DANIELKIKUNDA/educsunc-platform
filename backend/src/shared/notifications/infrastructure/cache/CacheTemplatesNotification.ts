import { ModeleNotification } from '../../domain';
import { EntreeCacheNotification, IndexCacheTemplatesNotification } from './TypesCacheNotification';

// Ce fichier implemente le cache des templates Notifications.

/** Cette classe met en cache les templates de notification pour les hot paths. */
export class CacheTemplatesNotification {
  private readonly index: IndexCacheTemplatesNotification = new Map();

  /** Ce constructeur fixe le TTL par defaut des templates en cache. */
  constructor(private readonly ttlMs = 300_000) {}

  /** Cette methode enregistre un template dans le cache. */
  public enregistrer(cle: string, modele: ModeleNotification): void {
    this.index.set(cle, this.construireEntree(cle, modele));
  }

  /** Cette methode lit un template si l'entree est encore fraiche. */
  public lire(cle: string): ModeleNotification | null {
    const entree = this.index.get(cle);
    if (!entree || this.estExpiree(entree)) {
      this.index.delete(cle);
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide un template precis. */
  public invalider(cle: string): void {
    this.index.delete(cle);
  }

  /** Cette methode construit une entree de cache standardisee. */
  private construireEntree(cle: string, modele: ModeleNotification): EntreeCacheNotification<ModeleNotification> {
    return {
      cle,
      valeur: modele,
      expireLe: new Date(Date.now() + this.ttlMs),
    };
  }

  /** Cette methode detecte si une entree de cache a expire. */
  private estExpiree(entree: EntreeCacheNotification<ModeleNotification>): boolean {
    return entree.expireLe.getTime() <= Date.now();
  }
}
