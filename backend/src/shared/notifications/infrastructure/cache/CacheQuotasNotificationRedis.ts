import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { QuotaCacheNotification } from './TypesCacheNotification';

// Ce fichier implemente la variante Redis du cache des quotas Notifications.

/** Cette classe conserve un miroir local tout en projetant les quotas techniques dans Redis partage. */
export class CacheQuotasNotificationRedis {
  private readonly index = new Map<string, QuotaCacheNotification>();

  /** Ce constructeur fixe le TTL des quotas et relie le cache au client Redis partage. */
  constructor(
    private readonly ttlMs = 60_000,
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
  ) {}

  /** Cette methode enregistre un quota calcule dans le miroir local et dans Redis partage. */
  public enregistrer(
    cle: string,
    valeur: number,
    organisationId?: string,
    ecoleId?: string,
    canal?: string,
  ): void {
    const quota: QuotaCacheNotification = {
      cle,
      organisationId,
      ecoleId,
      canal,
      valeur,
      expireLe: new Date(Date.now() + this.ttlMs),
    };
    this.index.set(cle, quota);
    void this.clientRedisShared.ecrireJson(
      this.construireCleRedis(cle),
      {
        cle,
        organisationId: organisationId ?? null,
        ecoleId: ecoleId ?? null,
        canal: canal ?? null,
        valeur,
        expireLe: quota.expireLe.toISOString(),
      },
      this.calculerTtlSecondes(),
    );
  }

  /** Cette methode lit un quota si l entree locale est encore fraiche. */
  public lire(cle: string): number | null {
    const entree = this.index.get(cle);
    if (!entree || entree.expireLe.getTime() <= Date.now()) {
      this.index.delete(cle);
      void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
      return null;
    }
    return entree.valeur;
  }

  /** Cette methode invalide un quota dans les deux couches de cache. */
  public invalider(cle: string): void {
    this.index.delete(cle);
    void this.clientRedisShared.supprimer(this.construireCleRedis(cle));
  }

  /** Cette methode construit la cle Redis partagee du quota. */
  private construireCleRedis(cle: string): string {
    return `notifications:cache:quotas:${cle}`;
  }

  /** Cette methode convertit un TTL millisecondes en secondes Redis. */
  private calculerTtlSecondes(): number {
    return Math.max(1, Math.ceil(this.ttlMs / 1000));
  }
}
