import {
  ComposantsRuntimeNotificationsBullMq,
  DependancesFabriqueRuntimeNotificationsBullMq,
  FabriqueRuntimeNotificationsBullMq,
} from './FabriqueRuntimeNotificationsBullMq';

// Ce fichier expose l initialiseur officiel du runtime BullMQ Notifications.

/** Cette classe construit puis demarre le runtime BullMQ Notifications a partir des briques infra. */
export class InitialiseurRuntimeNotificationsBullMq {
  /** Ce constructeur accepte une fabrique runtime BullMQ injectable pour les tests et le bootstrap. */
  constructor(
    private readonly fabriqueRuntimeNotificationsBullMq = new FabriqueRuntimeNotificationsBullMq(),
  ) {}

  /** Cette methode construit et demarre les composants runtime BullMQ Notifications. */
  public initialiser(
    dependances: DependancesFabriqueRuntimeNotificationsBullMq,
  ): ComposantsRuntimeNotificationsBullMq {
    const composants = this.fabriqueRuntimeNotificationsBullMq.creer(dependances);
    composants.coordinateurRuntimeNotifications.demarrer();
    return composants;
  }
}
