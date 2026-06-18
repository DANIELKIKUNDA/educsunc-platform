import {
  ConfigurationQuotasNotification,
  type ConfigurationQuotaCanalNotification,
} from '../../../infrastructure/config';
import { CanalNotification } from '../../../domain';

// Ce fichier adapte les changements de quotas du module Configuration vers Notifications.

const CANAUX_CONFIGURATION_QUOTAS: readonly CanalNotification[] = [
  'IN_APP',
  'SMS',
  'EMAIL',
  'WHATSAPP',
  'PUSH',
  'WEBHOOK',
];

// Cette classe synchronise les quotas techniques recalculés pour le moteur Notifications.
/** Cette classe applique et expose les quotas techniques au format Notifications. */
export class NotificationConfigurationQuotasBridge {
  /** Ce constructeur relie le pont quotas a la facade technique des quotas Notifications. */
  constructor(
    private readonly configurationQuotasNotification: ConfigurationQuotasNotification,
  ) {}

  /** Cette methode applique un quota a un canal donne. */
  public appliquerQuota(quota: ConfigurationQuotaCanalNotification): void {
    this.configurationQuotasNotification.definirQuota(quota);
  }

  /** Cette methode retourne les quotas techniques connus pour tous les canaux Notifications. */
  public listerQuotas(): ConfigurationQuotaCanalNotification[] {
    return CANAUX_CONFIGURATION_QUOTAS.map((canal) =>
      this.configurationQuotasNotification.obtenirQuota(canal),
    );
  }
}
