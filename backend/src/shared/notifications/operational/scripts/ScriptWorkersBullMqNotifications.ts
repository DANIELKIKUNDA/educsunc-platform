import { CoordinateurWorkersNotifications, RegistreRuntimeNotifications } from '../../runtime';
import { ResultatExecutionWorkerNotifications } from '../../workers';

// Ce fichier expose les operations locales de pilotage des workers BullMQ du module Notifications.

/** Cette classe pilote une passe globale des workers BullMQ et expose leur dernier etat. */
export class ScriptWorkersBullMqNotifications {
  /** Ce constructeur relie le script au coordinateur runtime des workers et au registre. */
  constructor(
    private readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications,
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
  ) {}

  /** Cette methode execute tous les workers BullMQ et retourne leurs resultats consolides. */
  public async executerCycleGlobal(): Promise<
    readonly ResultatExecutionWorkerNotifications[]
  > {
    return this.coordinateurWorkersNotifications.executerCycleGlobal();
  }

  /** Cette methode retourne les derniers resultats workers connus depuis le registre runtime. */
  public observerDerniersResultats(): readonly ResultatExecutionWorkerNotifications[] {
    return this.registreRuntimeNotifications.observer().derniersResultatsWorkers;
  }
}
