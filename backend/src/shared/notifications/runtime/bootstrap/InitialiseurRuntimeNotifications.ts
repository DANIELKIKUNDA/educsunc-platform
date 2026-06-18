import {
  ComposantsRuntimeNotifications,
  DependancesFabriqueRuntimeNotifications,
  FabriqueRuntimeNotifications,
} from './FabriqueRuntimeNotifications';

// Ce fichier expose l'initialiseur officiel du runtime Notifications.

/** Cette classe construit puis demarre le runtime Notifications a partir des briques infra. */
export class InitialiseurRuntimeNotifications {
  /** Ce constructeur accepte une fabrique runtime injectable pour les tests et le bootstrap. */
  constructor(
    private readonly fabriqueRuntimeNotifications = new FabriqueRuntimeNotifications(),
  ) {}

  /** Cette methode construit et demarre les composants runtime Notifications. */
  public initialiser(
    dependances: DependancesFabriqueRuntimeNotifications,
  ): ComposantsRuntimeNotifications {
    const composants = this.fabriqueRuntimeNotifications.creer(dependances);
    composants.coordinateurRuntimeNotifications.demarrer();
    return composants;
  }
}
