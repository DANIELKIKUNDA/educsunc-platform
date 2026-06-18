import {
  CoordinateurWorkersNotifications,
  RuntimeRateLimitingNotifications,
  RuntimeThrottlingNotifications,
} from '../../runtime';
import { ResultatExecutionWorkerNotifications } from '../../workers';

// Ce fichier expose les operations locales de retry du module Notifications.

/** Cette classe regroupe le pilotage retry et les verifications de throttling associees. */
export class ScriptRetryNotifications {
  /** Ce constructeur relie le script aux briques runtime de retry et de regulation. */
  constructor(
    private readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications,
    private readonly runtimeRateLimitingNotifications: RuntimeRateLimitingNotifications,
    private readonly runtimeThrottlingNotifications: RuntimeThrottlingNotifications,
  ) {}

  /** Cette methode execute une passe workers et retourne le resultat retry. */
  public async executerCycleRetry(): Promise<ResultatExecutionWorkerNotifications | null> {
    const resultats = await this.coordinateurWorkersNotifications.executerCycleGlobal();
    return resultats.find((resultat) => resultat.typeWorker === 'RETRY') ?? null;
  }

  /** Cette methode retourne un diagnostic local des limitations runtime. */
  public observerRegulation(): {
    readonly throttling: ReturnType<RuntimeThrottlingNotifications['observer']>;
    readonly rateLimiting: ReturnType<RuntimeRateLimitingNotifications['observer']>;
  } {
    const cle = {
      identifiant: 'notifications-operational',
      organisationId: 'notifications-operational',
      canal: 'IN_APP',
    } as const;
    return {
      throttling: this.runtimeThrottlingNotifications.observer(cle),
      rateLimiting: this.runtimeRateLimitingNotifications.observer(cle),
    };
  }
}
