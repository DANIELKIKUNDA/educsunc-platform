import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { CacheQuotasNotificationRedis } from '../cache';
import { ConfigurationNotificationRuntime } from '../config';
import {
  CleThrottlingNotification,
  EtatThrottlingNotification,
  ResultatThrottlingNotification,
} from './TypesThrottlingNotification';

// Ce fichier implemente la variante Redis du regulateur de throttling Notifications.

/** Cette classe projette le throttling technique dans Redis tout en gardant un miroir local utile. */
export class RegulateurThrottlingNotificationRedis {
  private readonly etats = new Map<string, EtatThrottlingNotification>();

  /** Ce constructeur relie le regulateur au cache quotas Redis, a la config runtime et au client Redis partage. */
  constructor(
    private readonly cacheQuotasNotificationRedis: CacheQuotasNotificationRedis,
    private readonly configurationNotificationRuntime: ConfigurationNotificationRuntime,
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
    private readonly fenetreMs = 60_000,
  ) {}

  /** Cette methode controle puis consomme un slot de throttling technique. */
  public async consommer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): Promise<ResultatThrottlingNotification> {
    const limite = await this.resoudreLimite(cle, limiteParDefaut);
    const cleTechnique = this.construireCleTechnique(cle);
    const cleRedis = this.construireCleRedis(cleTechnique);
    const maintenant = new Date();

    const compteur = await this.clientRedisShared.incrementer(cleRedis, 1);
    if (compteur === 1) {
      await this.clientRedisShared.definirExpiration(
        cleRedis,
        Math.max(1, Math.ceil(this.fenetreMs / 1000)),
      );
    }

    const etat = this.construireEtat(cleTechnique, compteur, limite, maintenant);
    this.etats.set(cleTechnique, etat);

    if (compteur > limite) {
      return {
        autorise: false,
        raison: 'La limite technique de throttling Redis est depassee.',
        controleLe: maintenant,
        etat,
      };
    }

    return {
      autorise: true,
      controleLe: maintenant,
      etat,
    };
  }

  /** Cette methode retourne l etat courant d une cle sans la consommer. */
  public observer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): EtatThrottlingNotification {
    const cleTechnique = this.construireCleTechnique(cle);
    const maintenant = new Date();
    const etat = this.etats.get(cleTechnique);

    if (!etat || etat.fenetreExpireLe.getTime() <= maintenant.getTime()) {
      return this.construireEtat(cleTechnique, 0, limiteParDefaut, maintenant);
    }

    return etat;
  }

  /** Cette methode reconstruit un etat technique lisible. */
  private construireEtat(
    cle: string,
    compteur: number,
    limite: number,
    maintenant: Date,
  ): EtatThrottlingNotification {
    return {
      cle,
      compteur,
      limite,
      fenetreDebutLe: maintenant,
      fenetreExpireLe: new Date(maintenant.getTime() + this.fenetreMs),
    };
  }

  /** Cette methode resolve la limite applicable a partir du cache et de la configuration runtime. */
  private async resoudreLimite(
    cle: CleThrottlingNotification,
    limiteParDefaut: number,
  ): Promise<number> {
    const throttlingActif = await this.configurationNotificationRuntime.lire<boolean>(
      'notifications.runtime.throttling.enabled',
      true,
    );
    if (!throttlingActif) {
      return Number.MAX_SAFE_INTEGER;
    }

    const cleQuota = this.construireCleQuota(cle);
    const quotaCache = this.cacheQuotasNotificationRedis.lire(cleQuota);
    if (quotaCache !== null) {
      return quotaCache;
    }

    const limite = await this.configurationNotificationRuntime.lire<number>(cleQuota, limiteParDefaut);
    this.cacheQuotasNotificationRedis.enregistrer(
      cleQuota,
      limite,
      cle.organisationId,
      cle.ecoleId,
      cle.canal,
    );
    return limite;
  }

  /** Cette methode construit la cle runtime utilisee pour les quotas. */
  private construireCleQuota(cle: CleThrottlingNotification): string {
    if (cle.canal) {
      return `notifications.quotas.${cle.canal.toLowerCase()}.hourlyLimit`;
    }
    return 'notifications.runtime.throttling.defaultLimit';
  }

  /** Cette methode construit la cle memoire/redis stable du regulateur. */
  private construireCleTechnique(cle: CleThrottlingNotification): string {
    return [
      cle.identifiant,
      cle.organisationId ?? '*',
      cle.ecoleId ?? '*',
      cle.canal ?? '*',
      cle.typeWorker ?? '*',
    ].join('::');
  }

  /** Cette methode construit la cle Redis technique du compteur. */
  private construireCleRedis(cleTechnique: string): string {
    return `notifications:throttling:${cleTechnique}`;
  }
}
