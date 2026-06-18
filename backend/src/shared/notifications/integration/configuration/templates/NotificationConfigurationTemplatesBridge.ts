import {
  ConfigurationTemplatesNotification,
  type ConfigurationTemplateNotification,
} from '../../../infrastructure/config';

// Ce fichier adapte les changements de templates du module Configuration vers Notifications.

/** Cette classe applique les regles de templating resolues au moteur Notifications. */
export class NotificationConfigurationTemplatesBridge {
  /** Ce constructeur relie le pont templates a la facade technique de templating Notifications. */
  constructor(
    private readonly configurationTemplatesNotification: ConfigurationTemplatesNotification,
  ) {}

  /** Cette methode applique une configuration de template au moteur Notifications. */
  public appliquerConfiguration(
    configuration: Partial<ConfigurationTemplateNotification>,
  ): void {
    this.configurationTemplatesNotification.definirConfiguration(configuration);
  }

  /** Cette methode retourne la configuration courante des templates Notifications. */
  public obtenirConfiguration(): ConfigurationTemplateNotification {
    return this.configurationTemplatesNotification.obtenirConfiguration();
  }
}
