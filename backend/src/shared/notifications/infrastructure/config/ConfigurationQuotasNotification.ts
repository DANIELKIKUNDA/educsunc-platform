// Ce fichier declare la configuration technique des quotas du module Notifications.

import { CanalNotification } from '../../domain';

const CANAUX_QUOTAS_NOTIFICATION: readonly CanalNotification[] = [
  'IN_APP',
  'SMS',
  'EMAIL',
  'WHATSAPP',
  'PUSH',
  'WEBHOOK',
];

/** Cette interface represente le quota runtime applicable a un canal. */
export interface ConfigurationQuotaCanalNotification {
  readonly canal: CanalNotification;
  readonly limiteParHeure: number;
  readonly limiteParJour: number;
  readonly budgetJournalier: number;
}

/** Cette classe centralise la configuration technique des quotas et budgets Notifications. */
export class ConfigurationQuotasNotification {
  /** Ce registre conserve les quotas techniques par canal. */
  private readonly quotasParCanal = new Map<CanalNotification, ConfigurationQuotaCanalNotification>();

  /** Ce constructeur initialise les quotas techniques par defaut. */
  constructor(quotasInitiaux?: readonly ConfigurationQuotaCanalNotification[]) {
    for (const quota of quotasInitiaux ?? this.obtenirQuotasParDefaut()) {
      this.quotasParCanal.set(quota.canal, quota);
    }
  }

  /** Cette methode retourne le quota d'un canal ou son quota par defaut. */
  public obtenirQuota(canal: CanalNotification): ConfigurationQuotaCanalNotification {
    return this.quotasParCanal.get(canal) ?? this.construireQuotaParDefaut(canal);
  }

  /** Cette methode remplace le quota technique d'un canal. */
  public definirQuota(quota: ConfigurationQuotaCanalNotification): void {
    this.quotasParCanal.set(quota.canal, quota);
  }

  /** Cette methode retourne si un volume donne reste dans les limites techniques. */
  public autoriserVolume(canal: CanalNotification, volumeHeure: number, volumeJour: number): boolean {
    const quota = this.obtenirQuota(canal);
    return volumeHeure <= quota.limiteParHeure && volumeJour <= quota.limiteParJour;
  }

  /** Cette methode expose un fragment plat reutilisable par la configuration runtime. */
  public convertirEnFragmentRuntime(): Readonly<Record<string, unknown>> {
    const fragment: Record<string, unknown> = {};

    for (const quota of this.quotasParCanal.values()) {
      const prefixe = `notifications.quotas.${quota.canal.toLowerCase()}`;
      fragment[`${prefixe}.hourlyLimit`] = quota.limiteParHeure;
      fragment[`${prefixe}.dailyLimit`] = quota.limiteParJour;
      fragment[`${prefixe}.dailyBudget`] = quota.budgetJournalier;
    }

    return fragment;
  }

  /** Cette methode retourne les quotas techniques par defaut. */
  private obtenirQuotasParDefaut(): readonly ConfigurationQuotaCanalNotification[] {
    return CANAUX_QUOTAS_NOTIFICATION.map((canal) => this.construireQuotaParDefaut(canal));
  }

  /** Cette methode construit le quota technique par defaut d'un canal. */
  private construireQuotaParDefaut(canal: CanalNotification): ConfigurationQuotaCanalNotification {
    if (canal === 'SMS' || canal === 'WHATSAPP') {
      return {
        canal,
        limiteParHeure: 250,
        limiteParJour: 1_500,
        budgetJournalier: 500,
      };
    }

    if (canal === 'EMAIL') {
      return {
        canal,
        limiteParHeure: 1_000,
        limiteParJour: 8_000,
        budgetJournalier: 2_500,
      };
    }

    return {
      canal,
      limiteParHeure: 5_000,
      limiteParJour: 50_000,
      budgetJournalier: 10_000,
    };
  }
}
