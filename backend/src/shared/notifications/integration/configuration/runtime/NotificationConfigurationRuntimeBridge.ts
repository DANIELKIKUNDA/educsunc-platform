import {
  ConfigurationNotificationRuntime,
  type InstantaneConfigurationNotificationRuntime,
} from '../../../infrastructure/config';
import type { NotificationConfigurationRuntimeFragment } from '../NotificationsConfigurationIntegrationTypes';

// Ce fichier adapte les fragments du module Configuration vers le runtime local Notifications.

/** Cette classe applique et observe les fragments runtime au format attendu par Notifications. */
export class NotificationConfigurationRuntimeBridge {
  /** Ce constructeur relie le pont runtime a la facade technique de configuration Notifications. */
  constructor(
    private readonly configurationNotificationRuntime: ConfigurationNotificationRuntime,
  ) {}

  /** Cette methode applique un fragment runtime au moteur Notifications. */
  public appliquerFragment(fragment: NotificationConfigurationRuntimeFragment): void {
    this.configurationNotificationRuntime.definirEnBloc(fragment.valeurs);
  }

  /** Cette methode lit une cle runtime via la facade technique Notifications. */
  public async lire<T>(cle: string, valeurParDefaut: T): Promise<T> {
    return this.configurationNotificationRuntime.lire(cle, valeurParDefaut);
  }

  /** Cette methode retourne l'instantane courant du runtime Notifications. */
  public obtenirInstantane(): InstantaneConfigurationNotificationRuntime {
    return this.configurationNotificationRuntime.obtenirInstantane();
  }
}
