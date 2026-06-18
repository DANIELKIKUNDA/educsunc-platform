import {
  CoordinateurWorkersNotifications,
  RuntimeRateLimitingNotificationsBullMq,
  RuntimeThrottlingNotifications,
} from '../../runtime';
import { ResultatExecutionWorkerNotifications } from '../../workers';

// Ce fichier expose les operations locales de retry du module Notifications sur le runtime BullMQ.

/** Cette classe regroupe le pilotage retry BullMQ et les verifications de regulation associees. */
export class ScriptRetryNotificationsBullMq {
  /** Ce constructeur relie le script aux briques runtime BullMQ de retry et de regulation. */
  constructor(
    private readonly coordinateurWorkersNotifications: CoordinateurWorkersNotifications,
    private readonly runtimeRateLimitingNotificationsBullMq: RuntimeRateLimitingNotificationsBullMq,
    private readonly runtimeThrottlingNotifications: RuntimeThrottlingNotifications,
  ) {}

  /** Cette methode execute une passe workers et retourne le resultat retry. */
  public async executerCycleRetry(): Promise<ResultatExecutionWorkerNotifications | null> {
    const resultats = await this.coordinateurWorkersNotifications.executerCycleGlobal();
    return resultats.find((resultat) => resultat.typeWorker === 'RETRY') ?? null;
  }

  /** Cette methode retourne un diagnostic local des limitations runtime BullMQ. */
  public async observerRegulation(): Promise<{
    readonly throttling: ReturnType<RuntimeThrottlingNotifications['observer']>;
    readonly rateLimiting: Awaited<ReturnType<RuntimeRateLimitingNotificationsBullMq['observer']>>;
  }> {
    const cle = {
      identifiant: 'notifications-operational-bullmq',
      organisationId: 'notifications-operational-bullmq',
      canal: 'IN_APP',
    } as const;
    return {
      throttling: this.runtimeThrottlingNotifications.observer(cle),
      rateLimiting: await this.runtimeRateLimitingNotificationsBullMq.observer(cle),
    };
  }
}
