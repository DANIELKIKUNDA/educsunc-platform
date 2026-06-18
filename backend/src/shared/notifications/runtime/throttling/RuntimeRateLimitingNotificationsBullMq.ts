import {
  CleThrottlingNotification,
  RegulateurRateLimitingNotificationBullMq,
  ResultatThrottlingNotification,
} from '../../infrastructure/throttling';

// Ce fichier expose le runtime de rate limiting BullMQ du module Notifications.

/** Cette classe habille le regulateur glissant Redis/BullMQ comme composant runtime officiel. */
export class RuntimeRateLimitingNotificationsBullMq {
  /** Ce constructeur relie le runtime au regulateur glissant BullMQ. */
  constructor(
    private readonly regulateurRateLimitingNotificationBullMq: RegulateurRateLimitingNotificationBullMq,
  ) {}

  /** Cette methode consomme une emission dans la fenetre glissante BullMQ. */
  public async consommer(
    cle: CleThrottlingNotification,
    limite: number,
  ): Promise<ResultatThrottlingNotification> {
    return this.regulateurRateLimitingNotificationBullMq.consommer(cle, limite);
  }

  /** Cette methode observe la pression courante sur une cle donnee. */
  public async observer(cle: CleThrottlingNotification): Promise<number> {
    return this.regulateurRateLimitingNotificationBullMq.observer(cle);
  }
}
