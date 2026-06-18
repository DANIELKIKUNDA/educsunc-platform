// Ce fichier declare la facade technique de planification des expirations Notifications.

import { PortMonitoringNotification } from '../../application';
import { ConfigurationNotificationRuntime } from '../config';
import {
  PlanificateurNotifications,
  TachePlanifieeNotification,
} from './PlanificateurNotifications';

/** Cette classe specialise le scheduler local pour les expirations techniques. */
export class PlanificateurExpirationNotifications {
  /** Ce constructeur assemble le scheduler commun, la config et le monitoring. */
  constructor(
    private readonly planificateurNotifications: PlanificateurNotifications,
    private readonly configurationNotificationRuntime: ConfigurationNotificationRuntime,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode planifie une expiration future pour une notification cible. */
  public async planifier(
    identifiantNotification: string,
    executeLe: Date,
    raison = 'expiration-planifiee',
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification | null> {
    const actif = await this.configurationNotificationRuntime.lire<boolean>(
      'notifications.runtime.expiration.enabled',
      true,
    );
    if (!actif) {
      await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.expiration.skipped', {
        identifiantNotification,
        raison: 'expiration-desactivee',
      });
      return null;
    }

    return this.planificateurNotifications.planifier(
      'EXPIRATION',
      executeLe,
      identifiantNotification,
      {
        ...metadata,
        raison,
      },
    );
  }

  /** Cette methode extrait les expirations techniquement echues. */
  public async extraireDisponibles(maintenant = new Date()): Promise<TachePlanifieeNotification[]> {
    const taches = await this.planificateurNotifications.extraireDisponibles('EXPIRATION', maintenant);
    if (taches.length > 0) {
      await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.expiration.ready', {
        total: taches.length,
      });
    }
    return taches;
  }
}
