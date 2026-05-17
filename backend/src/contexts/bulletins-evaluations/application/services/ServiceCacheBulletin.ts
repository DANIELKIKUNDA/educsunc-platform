import { CacheException } from '../exceptions/CacheException';
import type { CacheBulletinPort } from '../ports/out/CacheBulletinPort';

// Ce service encapsule les operations de cache pour les lectures optimisees du BC.
export class ServiceCacheBulletin {
  constructor(private readonly cachePort?: CacheBulletinPort) {}

  // Cette methode lit une valeur depuis le cache applicatif.
  public async obtenir<T>(cle: string): Promise<T | null> {
    try {
      return (await this.cachePort?.obtenir<T>(cle)) ?? null;
    } catch {
      throw new CacheException('Impossible de lire la valeur demandee dans le cache.');
    }
  }

  // Cette methode enregistre une valeur dans le cache applicatif.
  public async enregistrer<T>(cle: string, valeur: T, ttlSecondes?: number): Promise<void> {
    try {
      await this.cachePort?.enregistrer(cle, valeur, ttlSecondes);
    } catch {
      throw new CacheException();
    }
  }

  // Cette methode invalide une valeur devenue obsolete.
  public async invalider(cle: string): Promise<void> {
    try {
      await this.cachePort?.invalider(cle);
    } catch {
      throw new CacheException('Impossible d invalider la cle de cache demandee.');
    }
  }
}
