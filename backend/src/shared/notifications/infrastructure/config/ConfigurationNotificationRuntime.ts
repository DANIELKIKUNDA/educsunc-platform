// Ce fichier declare la facade technique de configuration runtime du module Notifications.

import { PortConfigurationNotification } from '../../application';
import { ConfigurationProvidersNotification } from './ConfigurationProvidersNotification';
import { ConfigurationQuotasNotification } from './ConfigurationQuotasNotification';
import { ConfigurationTemplatesNotification } from './ConfigurationTemplatesNotification';

/** Cette interface represente un instantane de configuration runtime Notifications. */
export interface InstantaneConfigurationNotificationRuntime {
  readonly dispatchAutomatiqueActif: boolean;
  readonly monitoringActif: boolean;
  readonly retryActif: boolean;
  readonly replayActif: boolean;
  readonly valeurs: Readonly<Record<string, unknown>>;
}

/** Cette classe centralise la lecture et l'ecriture des valeurs techniques runtime. */
export class ConfigurationNotificationRuntime implements PortConfigurationNotification {
  /** Ce magasin conserve les valeurs techniques aplaties du runtime. */
  private readonly valeurs = new Map<string, unknown>();

  /** Ce constructeur hydrate la configuration runtime a partir des blocs techniques dedies. */
  constructor(
    private readonly configurationProviders = new ConfigurationProvidersNotification(),
    private readonly configurationTemplates = new ConfigurationTemplatesNotification(),
    private readonly configurationQuotas = new ConfigurationQuotasNotification(),
    configurationInitiale?: Readonly<Record<string, unknown>>,
  ) {
    this.hydraterValeursParDefaut();
    this.definirEnBloc(configurationInitiale ?? {});
  }

  /** Cette methode lit une valeur de configuration avec fallback de securite. */
  public async lire<T>(cle: string, valeurParDefaut: T): Promise<T> {
    const valeur = this.valeurs.get(cle);
    return (valeur as T | undefined) ?? valeurParDefaut;
  }

  /** Cette methode ecrit ou remplace une valeur technique runtime. */
  public definir(cle: string, valeur: unknown): void {
    this.valeurs.set(cle, valeur);
  }

  /** Cette methode fusionne un bloc de configuration technique dans le runtime local. */
  public definirEnBloc(configuration: Readonly<Record<string, unknown>>): void {
    for (const [cle, valeur] of Object.entries(configuration)) {
      this.valeurs.set(cle, valeur);
    }
  }

  /** Cette methode retourne un instantane lisible de la configuration runtime courante. */
  public obtenirInstantane(): InstantaneConfigurationNotificationRuntime {
    const valeurs = Object.freeze(Object.fromEntries(this.valeurs.entries()));

    return {
      dispatchAutomatiqueActif: Boolean(valeurs['notifications.dispatch.autoQueue'] ?? true),
      monitoringActif: Boolean(valeurs['notifications.monitoring.enabled'] ?? true),
      retryActif: Boolean(valeurs['notifications.retry.enabled'] ?? true),
      replayActif: Boolean(valeurs['notifications.replay.enabled'] ?? true),
      valeurs,
    };
  }

  /** Cette methode hydrate les valeurs runtime par defaut du moteur Notifications. */
  private hydraterValeursParDefaut(): void {
    this.definirEnBloc({
      'notifications.dispatch.autoQueue': true,
      'notifications.monitoring.enabled': true,
      'notifications.retry.enabled': true,
      'notifications.retry.maxAttempts': 5,
      'notifications.retry.defaultBackoffMs': 60_000,
      'notifications.replay.enabled': true,
      'notifications.replay.batchSize': 100,
      'notifications.replay.rebuildChronology': true,
      'notifications.runtime.cleanup.enabled': true,
      'notifications.runtime.archival.enabled': true,
      'notifications.runtime.expiration.enabled': true,
      'notifications.runtime.throttling.enabled': true,
      'notifications.runtime.recovery.enabled': true,
    });

    this.definirEnBloc(this.configurationProviders.convertirEnFragmentRuntime());
    this.definirEnBloc(this.configurationTemplates.convertirEnFragmentRuntime());
    this.definirEnBloc(this.configurationQuotas.convertirEnFragmentRuntime());
  }
}
