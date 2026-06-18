import {
  ComposantsOperationalNotificationsBullMq,
  DependancesOperationalNotificationsBullMq,
  FabriqueOperationalNotificationsBullMq,
} from './FabriqueOperationalNotificationsBullMq';

// Ce fichier expose l initialiseur officiel de la couche operational BullMQ Notifications.

/** Cette classe construit le conteneur operational BullMQ pret a etre exploite localement. */
export class InitialiseurOperationalNotificationsBullMq {
  /** Ce constructeur accepte une fabrique operational BullMQ injectable pour les tests et scripts. */
  constructor(
    private readonly fabriqueOperationalNotificationsBullMq = new FabriqueOperationalNotificationsBullMq(),
  ) {}

  /** Cette methode cree l environnement operational complet du module Notifications sur BullMQ. */
  public initialiser(
    dependances: DependancesOperationalNotificationsBullMq,
  ): ComposantsOperationalNotificationsBullMq {
    return this.fabriqueOperationalNotificationsBullMq.creer(dependances);
  }
}
