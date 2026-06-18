// Ce fichier declare le regulateur technique de throttling du moteur Notifications.

import { CacheQuotasNotification } from '../cache';
import { ConfigurationNotificationRuntime } from '../config';
import {
  CleThrottlingNotification,
  EtatThrottlingNotification,
  ResultatThrottlingNotification,
} from './TypesThrottlingNotification';

/** Cette classe applique une regulation technique simple par fenetre fixe. */
export class RegulateurThrottlingNotification {
  /** Ce registre conserve l'etat courant des fenetres techniques actives. */
  private readonly etats = new Map<string, EtatThrottlingNotification>();

  /** Ce constructeur relie la regulation au cache quotas et a la configuration runtime. */
  constructor(
    private readonly cacheQuotasNotification: CacheQuotasNotification,
    private readonly configurationNotificationRuntime: ConfigurationNotificationRuntime,
    private readonly fenetreMs = 60_000,
  ) {}

  /** Cette methode controle puis consomme un slot de throttling pour une cle technique. */
  public async consommer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): Promise<ResultatThrottlingNotification> {
    const limite = await this.resoudreLimite(cle, limiteParDefaut);
    const cleTechnique = this.construireCleTechnique(cle);
    const maintenant = new Date();
    const courant = this.etats.get(cleTechnique);

    const etat =
      !courant || courant.fenetreExpireLe.getTime() <= maintenant.getTime()
        ? this.creerEtat(cleTechnique, limite, maintenant)
        : courant;

    const prochainCompteur = etat.compteur + 1;
    const misAJour: EtatThrottlingNotification = {
      ...etat,
      compteur: prochainCompteur,
      limite,
    };
    this.etats.set(cleTechnique, misAJour);

    if (prochainCompteur > limite) {
      return {
        autorise: false,
        raison: 'La limite technique de throttling est depassee.',
        controleLe: maintenant,
        etat: misAJour,
      };
    }

    return {
      autorise: true,
      controleLe: maintenant,
      etat: misAJour,
    };
  }

  /** Cette methode retourne l'etat courant d'une cle technique sans le consommer. */
  public observer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): EtatThrottlingNotification {
    const cleTechnique = this.construireCleTechnique(cle);
    const maintenant = new Date();
    const etat = this.etats.get(cleTechnique);
    if (!etat || etat.fenetreExpireLe.getTime() <= maintenant.getTime()) {
      return this.creerEtat(cleTechnique, limiteParDefaut, maintenant);
    }
    return etat;
  }

  /** Cette methode reconstruit l'etat initial d'une fenetre technique. */
  private creerEtat(cle: string, limite: number, maintenant: Date): EtatThrottlingNotification {
    return {
      cle,
      compteur: 0,
      limite,
      fenetreDebutLe: maintenant,
      fenetreExpireLe: new Date(maintenant.getTime() + this.fenetreMs),
    };
  }

  /** Cette methode resout la limite technique applicable a une cle donnee. */
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
    const quotaCache = this.cacheQuotasNotification.lire(cleQuota);
    if (quotaCache !== null) {
      return quotaCache;
    }

    const limite = await this.configurationNotificationRuntime.lire<number>(cleQuota, limiteParDefaut);
    this.cacheQuotasNotification.enregistrer(cleQuota, limite, cle.organisationId, cle.ecoleId, cle.canal);
    return limite;
  }

  /** Cette methode construit la cle runtime utilisee par la configuration et le cache. */
  private construireCleQuota(cle: CleThrottlingNotification): string {
    if (cle.canal) {
      return `notifications.quotas.${cle.canal.toLowerCase()}.hourlyLimit`;
    }
    return 'notifications.runtime.throttling.defaultLimit';
  }

  /** Cette methode construit la cle memoire stable du regulateur. */
  private construireCleTechnique(cle: CleThrottlingNotification): string {
    return [
      cle.identifiant,
      cle.organisationId ?? '*',
      cle.ecoleId ?? '*',
      cle.canal ?? '*',
      cle.typeWorker ?? '*',
    ].join('::');
  }
}
