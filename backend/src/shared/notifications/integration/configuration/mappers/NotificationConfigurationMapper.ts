import type { ConfigurationContext } from 'shared/configuration';
import type { NotificationConfigurationRuntimeFragment } from '../NotificationsConfigurationIntegrationTypes';

// Ce fichier traduit les changements du module Configuration vers des fragments utilisables par Notifications.

/** Cette classe convertit les changements Configuration en structures stables pour le runtime Notifications. */
export class NotificationConfigurationMapper {
  /** Cette methode normalise un bloc de changement en fragment runtime typé. */
  public static versFragmentRuntime(
    contexteConfiguration: ConfigurationContext,
    valeurs: Readonly<Record<string, unknown>>,
  ): NotificationConfigurationRuntimeFragment {
    return {
      valeurs: { ...valeurs },
      changedAt: contexteConfiguration.changedAt,
      organisationId: contexteConfiguration.organisationId,
      ecoleId: contexteConfiguration.ecoleId,
    };
  }
}
