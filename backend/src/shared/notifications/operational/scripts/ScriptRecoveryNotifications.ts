import {
  RuntimeRecoveryDeadLetters,
  RuntimeRecoveryNotifications,
  RuntimeRecoveryProviders,
} from '../../runtime';

// Ce fichier expose les operations locales de recovery du module Notifications.

/** Cette classe centralise les commandes de recovery utiles au support local du module. */
export class ScriptRecoveryNotifications {
  /** Ce constructeur relie le script aux briques runtime de recovery deja posees. */
  constructor(
    private readonly runtimeRecoveryNotifications: RuntimeRecoveryNotifications,
    private readonly runtimeRecoveryDeadLetters: RuntimeRecoveryDeadLetters,
    private readonly runtimeRecoveryProviders: RuntimeRecoveryProviders,
  ) {}

  /** Cette methode lance une passe globale de recovery. */
  public async executerPasseGlobale(): Promise<Awaited<ReturnType<RuntimeRecoveryNotifications['executerPasse']>>> {
    return this.runtimeRecoveryNotifications.executerPasse();
  }

  /** Cette methode relance explicitement la dead-letter queue. */
  public async relancerDeadLetters(limite = 25): Promise<Awaited<ReturnType<RuntimeRecoveryDeadLetters['rejouer']>>> {
    return this.runtimeRecoveryDeadLetters.rejouer(limite);
  }

  /** Cette methode verifie la sante des providers recuperables. */
  public async verifierProviders(): Promise<Awaited<ReturnType<RuntimeRecoveryProviders['verifierSante']>>> {
    return this.runtimeRecoveryProviders.verifierSante();
  }
}
