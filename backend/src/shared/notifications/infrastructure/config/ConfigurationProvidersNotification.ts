// Ce fichier declare la configuration technique des providers du module Notifications.

import { CanalNotification } from '../../domain';

const CANAUX_NOTIFICATION: readonly CanalNotification[] = [
  'IN_APP',
  'SMS',
  'EMAIL',
  'WHATSAPP',
  'PUSH',
  'WEBHOOK',
];

/** Cette interface represente la configuration d'un canal provider. */
export interface ConfigurationCanalProviderNotification {
  readonly canal: CanalNotification;
  readonly actif: boolean;
  readonly timeoutMs: number;
  readonly tailleLotMaximale: number;
  readonly tentativeMaximaleAvantPanne: number;
}

/** Cette classe centralise la configuration technique des providers par canal. */
export class ConfigurationProvidersNotification {
  /** Ce registre conserve la configuration de chaque canal provider. */
  private readonly configurationsParCanal = new Map<CanalNotification, ConfigurationCanalProviderNotification>();

  /** Ce constructeur initialise les valeurs runtime par defaut. */
  constructor(configurationsInitiales?: readonly ConfigurationCanalProviderNotification[]) {
    for (const configuration of configurationsInitiales ?? this.obtenirConfigurationsParDefaut()) {
      this.configurationsParCanal.set(configuration.canal, configuration);
    }
  }

  /** Cette methode retourne la configuration d'un canal ou sa valeur par defaut. */
  public obtenirConfiguration(canal: CanalNotification): ConfigurationCanalProviderNotification {
    return this.configurationsParCanal.get(canal) ?? this.construireConfigurationParDefaut(canal);
  }

  /** Cette methode remplace la configuration d'un canal donne. */
  public definirConfiguration(configuration: ConfigurationCanalProviderNotification): void {
    this.configurationsParCanal.set(configuration.canal, configuration);
  }

  /** Cette methode expose un fragment plat reutilisable par la configuration runtime. */
  public convertirEnFragmentRuntime(): Readonly<Record<string, unknown>> {
    const fragment: Record<string, unknown> = {};

    for (const configuration of this.configurationsParCanal.values()) {
      const prefixe = `notifications.providers.${configuration.canal.toLowerCase()}`;
      fragment[`${prefixe}.enabled`] = configuration.actif;
      fragment[`${prefixe}.timeoutMs`] = configuration.timeoutMs;
      fragment[`${prefixe}.batchSize`] = configuration.tailleLotMaximale;
      fragment[`${prefixe}.failureThreshold`] = configuration.tentativeMaximaleAvantPanne;
    }

    return fragment;
  }

  /** Cette methode construit les valeurs par defaut du moteur Notifications. */
  private obtenirConfigurationsParDefaut(): readonly ConfigurationCanalProviderNotification[] {
    return CANAUX_NOTIFICATION.map((canal) => this.construireConfigurationParDefaut(canal));
  }

  /** Cette methode construit la configuration par defaut d'un canal donne. */
  private construireConfigurationParDefaut(
    canal: CanalNotification,
  ): ConfigurationCanalProviderNotification {
    const actifParDefaut = canal === 'IN_APP' || canal === 'SMS' || canal === 'EMAIL';

    return {
      canal,
      actif: actifParDefaut,
      timeoutMs: actifParDefaut ? 30_000 : 10_000,
      tailleLotMaximale: canal === 'IN_APP' ? 250 : 100,
      tentativeMaximaleAvantPanne: 3,
    };
  }
}
