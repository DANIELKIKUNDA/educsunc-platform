import {
  ComposantsOperationalNotifications,
  DependancesOperationalNotifications,
  FabriqueOperationalNotifications,
} from './FabriqueOperationalNotifications';

// Ce fichier expose l initialiseur officiel de la couche operational Notifications.

/** Cette classe construit le conteneur operational pret a etre exploite localement. */
export class InitialiseurOperationalNotifications {
  /** Ce constructeur accepte une fabrique operational injectable pour les tests et scripts. */
  constructor(
    private readonly fabriqueOperationalNotifications = new FabriqueOperationalNotifications(),
  ) {}

  /** Cette methode cree l environnement operational complet du module Notifications. */
  public initialiser(
    dependances: DependancesOperationalNotifications,
  ): ComposantsOperationalNotifications {
    return this.fabriqueOperationalNotifications.creer(dependances);
  }
}
