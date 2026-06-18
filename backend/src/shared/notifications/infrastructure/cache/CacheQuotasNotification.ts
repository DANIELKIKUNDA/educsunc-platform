import { QuotaCacheNotification } from './TypesCacheNotification';

// Ce fichier implemente le cache des quotas Notifications.

/** Cette classe met en cache les quotas techniques calcules pour les canaux et tenants. */
export class CacheQuotasNotification {
  private readonly index = new Map<string, QuotaCacheNotification>();

  /** Ce constructeur fixe le TTL par defaut des quotas en cache. */
  constructor(private readonly ttlMs = 60_000) {}

  /** Cette methode enregistre un quota calcule dans le cache. */
  public enregistrer(
    cle: string,
    valeur: number,
    organisationId?: string,
    ecoleId?: string,
    canal?: string,
  ): void {
    this.index.set(cle, {
      cle,
      organisationId,
      ecoleId,
      canal,
      valeur,
      expireLe: new Date(Date.now() + this.ttlMs),
    });
  }

  /** Cette methode lit un quota si l'entree est encore fraiche. */
  public lire(cle: string): number | null {
    const entree = this.index.get(cle);
    if (!entree || entree.expireLe.getTime() <= Date.now()) {
      this.index.delete(cle);
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide un quota technique en cache. */
  public invalider(cle: string): void {
    this.index.delete(cle);
  }
}
