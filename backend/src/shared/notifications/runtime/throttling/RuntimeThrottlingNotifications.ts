import {
  CleThrottlingNotification,
  EtatThrottlingNotification,
  ResultatThrottlingNotification,
} from '../../infrastructure/throttling';

// Ce fichier expose le runtime de throttling a fenetre fixe du module Notifications.

/** Cette interface represente le contrat minimal attendu d un regulateur de throttling runtime. */
export interface ContratRegulateurThrottlingRuntimeNotifications {
  consommer(
    cle: CleThrottlingNotification,
    limiteParDefaut?: number,
  ): Promise<ResultatThrottlingNotification>;
  observer(cle: CleThrottlingNotification, limiteParDefaut?: number): EtatThrottlingNotification;
}

/** Cette classe habille le regulateur technique comme composant runtime officiel. */
export class RuntimeThrottlingNotifications {
  /** Ce constructeur relie le runtime au regulateur technique de throttling. */
  constructor(
    private readonly regulateurThrottlingNotification: ContratRegulateurThrottlingRuntimeNotifications,
  ) {}

  /** Cette methode consomme un slot de throttling dans le runtime. */
  public async consommer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): Promise<ResultatThrottlingNotification> {
    return this.regulateurThrottlingNotification.consommer(cle, limiteParDefaut);
  }

  /** Cette methode observe l'etat courant du throttling. */
  public observer(
    cle: CleThrottlingNotification,
    limiteParDefaut = 100,
  ): EtatThrottlingNotification {
    return this.regulateurThrottlingNotification.observer(cle, limiteParDefaut);
  }
}
