import {
  PlanificateurExpirationNotifications,
} from '../../infrastructure/scheduler';
import { TachePlanifieeNotification } from '../../infrastructure/scheduler/PlanificateurNotifications';

// Ce fichier expose le runtime specialise de gestion des expirations Notifications.

/** Cette classe habille la planification d'expiration comme composant runtime officiel. */
export class RuntimeExpirationNotifications {
  /** Ce constructeur relie le runtime a la facade technique des expirations. */
  constructor(
    private readonly planificateurExpirationNotifications: PlanificateurExpirationNotifications,
  ) {}

  /** Cette methode planifie une expiration future. */
  public async planifier(
    identifiantNotification: string,
    executeLe: Date,
    raison = 'runtime-expiration',
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification | null> {
    return this.planificateurExpirationNotifications.planifier(
      identifiantNotification,
      executeLe,
      raison,
      metadata,
    );
  }

  /** Cette methode extrait les expirations echues. */
  public async extraireDisponibles(maintenant = new Date()): Promise<TachePlanifieeNotification[]> {
    return this.planificateurExpirationNotifications.extraireDisponibles(maintenant);
  }
}
