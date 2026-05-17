import type { CacheBulletinPort } from 'contexts/bulletins-evaluations/application/ports/out/CacheBulletinPort';
import type { ServiceCache } from 'shared/infrastructure/cache/CacheService';

// Ce fichier adapte le service de cache shared au besoin de lecture rapide des bulletins.
export class BulletinCacheAdapter implements CacheBulletinPort {
  // Ce constructeur injecte le cache shared afin d'eviter une implementation locale.
  constructor(private readonly cache: ServiceCache) {}

  // Cette methode tente de relire une valeur deja mise en cache.
  public async obtenir<T>(cle: string): Promise<T | null> {
    return await this.cache.recuperer(cle) as T | null;
  }

  // Cette methode memorise une valeur metier dans le cache shared.
  public async enregistrer<T>(cle: string, valeur: T, ttlSecondes?: number): Promise<void> {
    await this.cache.enregistrer(cle, valeur, ttlSecondes);
  }

  // Cette methode supprime une entree du cache lorsqu'elle devient obsolete.
  public async invalider(cle: string): Promise<void> {
    await this.cache.supprimer(cle);
  }
}
