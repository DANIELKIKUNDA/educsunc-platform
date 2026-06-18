import {
  CleThrottlingNotification,
  RegulateurRateLimitingNotification,
  ResultatThrottlingNotification,
} from '../../infrastructure/throttling';

// Ce fichier expose le runtime de rate limiting glissant du module Notifications.

/** Cette classe habille le regulateur glissant comme composant runtime officiel. */
export class RuntimeRateLimitingNotifications {
  /** Ce constructeur relie le runtime au regulateur glissant. */
  constructor(
    private readonly regulateurRateLimitingNotification: RegulateurRateLimitingNotification,
  ) {}

  /** Cette methode consomme une emission dans la fenetre glissante. */
  public consommer(
    cle: CleThrottlingNotification,
    limite: number,
  ): ResultatThrottlingNotification {
    return this.regulateurRateLimitingNotification.consommer(cle, limite);
  }

  /** Cette methode observe la pression courante sur une cle donnee. */
  public observer(cle: CleThrottlingNotification): number {
    return this.regulateurRateLimitingNotification.observer(cle);
  }
}
