// Ce fichier declare la facade technique de planification des archivages Notifications.

import { PortMonitoringNotification } from '../../application';
import { ConfigurationNotificationRuntime } from '../config';
import {
  PlanificateurNotifications,
  TachePlanifieeNotification,
} from './PlanificateurNotifications';

/** Cette classe specialise le scheduler local pour les archivages techniques. */
export class PlanificateurArchivageNotifications {
  /** Ce constructeur assemble le scheduler commun, la config et le monitoring. */
  constructor(
    private readonly planificateurNotifications: PlanificateurNotifications,
    private readonly configurationNotificationRuntime: ConfigurationNotificationRuntime,
    private readonly portMonitoringNotification: PortMonitoringNotification,
  ) {}

  /** Cette methode planifie un archivage futur pour une notification cible. */
  public async planifier(
    identifiantNotification: string,
    executeLe: Date,
    raison = 'archivage-planifie',
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification | null> {
    const actif = await this.configurationNotificationRuntime.lire<boolean>(
      'notifications.runtime.archival.enabled',
      true,
    );
    if (!actif) {
      await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.archival.skipped', {
        identifiantNotification,
        raison: 'archivage-desactive',
      });
      return null;
    }

    return this.planificateurNotifications.planifier(
      'ARCHIVAGE',
      executeLe,
      identifiantNotification,
      {
        ...metadata,
        raison,
      },
    );
  }

  /** Cette methode extrait les archivages techniquement echus. */
  public async extraireDisponibles(maintenant = new Date()): Promise<TachePlanifieeNotification[]> {
    const taches = await this.planificateurNotifications.extraireDisponibles('ARCHIVAGE', maintenant);
    if (taches.length > 0) {
      await this.portMonitoringNotification.enregistrerSignal('notifications.scheduler.archival.ready', {
        total: taches.length,
      });
    }
    return taches;
  }
}
