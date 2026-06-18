import { CoordinateurWorkersNotifications, RuntimeRecoveryDeadLetters } from '../../runtime';
import { ResultatExecutionWorkerNotifications } from '../../workers';

// Ce fichier expose les operations locales de replay du module Notifications.

/** Cette classe regroupe les actions de replay et de rejeu DLQ utiles en exploitation locale. */
export class ScriptReplayNotifications {
  /** Ce constructeur relie le script aux briques runtime de replay deja disponibles. */
  constructor(
    private readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications,
    private readonly runtimeRecoveryDeadLetters: RuntimeRecoveryDeadLetters,
  ) {}

  /** Cette methode execute une passe workers et extrait le resultat du worker replay. */
  public async executerCycleReplay(): Promise<ResultatExecutionWorkerNotifications | null> {
    const resultats = await this.coordinateurWorkersNotifications.executerCycleGlobal();
    return resultats.find((resultat) => resultat.typeWorker === 'REPLAY') ?? null;
  }

  /** Cette methode relance les jobs dead-letterises vers la file de replay. */
  public async relancerDepuisDeadLetter(limite = 25): Promise<Awaited<ReturnType<RuntimeRecoveryDeadLetters['rejouer']>>> {
    return this.runtimeRecoveryDeadLetters.rejouer(limite);
  }
}
