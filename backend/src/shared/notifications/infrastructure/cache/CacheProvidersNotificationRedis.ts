import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { ProviderNotificationTechnique } from '../providers';
import { EntreeCacheNotification, IndexCacheProvidersNotification } from './TypesCacheNotification';

// Ce fichier implemente la variante Redis du cache des providers Notifications.

/** Cette classe conserve un miroir local tout en projetant les resolutions providers dans Redis partage. */
export class CacheProvidersNotificationRedis {
  private readonly index: IndexCacheProvidersNotification = new Map();

  /** Ce constructeur fixe le TTL des providers et relie le cache au client Redis partage. */
  constructor(
    private readonly ttlMs = 120_000,
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
  ) {}

  /** Cette methode enregistre un provider resolu dans le miroir local et dans Redis partage. */
  public enregistrer(cle: string, provider: ProviderNotificationTechnique): void {
    this.index.set(cle, {
      cle,
      valeur: provider,
      expireLe: new Date(Date.now() + this.ttlMs),
    });
    void this.clientRedisShared.ecrireJson(
      this.construireCleRedis(cle),
      {
        nom: provider.obtenirNom(),
        canal: provider.obtenirCanal(),
      },
      this.calculerTtlSecondes(),
    );
  }

  /** Cette methode lit un provider resolu si l entree locale est encore fraiche. */
  public lire(cle: string): ProviderNotificationTechnique | null {
    const entree = this.index.get(cle);
    if (!entree || this.estExpiree(entree)) {
      this.index.delete(cle);
      void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide la resolution d un provider dans les deux couches. */
  public invalider(cle: string): void {
    this.index.delete(cle);
    void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
  }

  /** Cette methode detecte si une entree locale a deja expire. */
  private estExpiree(entree: EntreeCacheNotification<ProviderNotificationTechnique>): boolean {
    return entree.expireLe.getTime() <= Date.now();
  }

  /** Cette methode construit la cle Redis partagee du provider resolu. */
  private construireCleRedis(cle: string): string {
    return `notifications:cache:providers:${cle}`;
  }

  /** Cette methode convertit un TTL millisecondes en secondes Redis. */
  private calculerTtlSecondes(): number {
    return Math.max(1, Math.ceil(this.ttlMs / 1000));
  }
}
