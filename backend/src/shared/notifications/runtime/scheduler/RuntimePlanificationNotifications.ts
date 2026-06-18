import {
  PlanificateurNotifications,
  SnapshotPlanificationNotifications,
  TachePlanifieeNotification,
} from '../../infrastructure/scheduler/PlanificateurNotifications';

// Ce fichier expose le noyau runtime de planification des Notifications.

/** Cette classe habille le scheduler technique comme composant runtime officiel. */
export class RuntimePlanificationNotifications {
  /** Ce constructeur relie le runtime au scheduler technique central. */
  constructor(private readonly planificateurNotifications: PlanificateurNotifications) {}

  /** Cette methode planifie une rediffusion technique future. */
  public async planifierDispatch(
    identifiantNotification: string,
    executeLe: Date,
    metadata: Readonly<Record<string, unknown>> = {},
  ): Promise<TachePlanifieeNotification> {
    return this.planificateurNotifications.planifier('DISPATCH', executeLe, identifiantNotification, metadata);
  }

  /** Cette methode lit les dispatchs echus sans les traiter. */
  public lireDispatchDisponibles(maintenant = new Date()): TachePlanifieeNotification[] {
    return this.planificateurNotifications.lireDisponibles('DISPATCH', maintenant);
  }

  /** Cette methode extrait les dispatchs echus pour execution. */
  public async extraireDispatchDisponibles(maintenant = new Date()): Promise<TachePlanifieeNotification[]> {
    return this.planificateurNotifications.extraireDisponibles('DISPATCH', maintenant);
  }

  /** Cette methode expose un snapshot global de planification. */
  public observer(maintenant = new Date()): SnapshotPlanificationNotifications {
    return this.planificateurNotifications.observer(maintenant);
  }
}
