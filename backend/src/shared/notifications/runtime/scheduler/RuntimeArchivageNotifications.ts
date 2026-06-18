import {
  PlanificateurArchivageNotifications,
} from '../../infrastructure/scheduler';
import { TachePlanifieeNotification } from '../../infrastructure/scheduler/PlanificateurNotifications';

// Ce fichier expose le runtime specialise de gestion des archivages Notifications.

/** Cette classe habille la planification d'archivage comme composant runtime officiel. */
export class RuntimeArchivageNotifications {
  /** Ce constructeur relie le runtime a la facade technique des archivages. */
  constructor(
    private readonly planificateurArchivageNotifications: PlanificateurArchivageNotifications,
  ) {}

  /** Cette methode planifie un archivage futur. */
  public async planifier(
    identifiantNotification: string,
    executeLe: Date,
    raison = 'runtime-archivage',
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification | null> {
    return this.planificateurArchivageNotifications.planifier(
      identifiantNotification,
      executeLe,
      raison,
      metadata,
    );
  }

  /** Cette methode extrait les archivages echus. */
  public async extraireDisponibles(maintenant = new Date()): Promise<TachePlanifieeNotification[]> {
    return this.planificateurArchivageNotifications.extraireDisponibles(maintenant);
  }
}
