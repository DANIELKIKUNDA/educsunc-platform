// Ce fichier expose un runbook local de runtime pour le module Notifications.

/** Cette classe fournit les etapes d exploitation locale du runtime Notifications. */
export class RunbookRuntimeNotifications {
  /** Cette methode retourne un runbook court pour demarrer et verifier le runtime. */
  public listerEtapes(): readonly string[] {
    return [
      'Configurer Redis local puis definir EDUCSYN_REDIS_MODE=reel pour valider le runtime sur la vraie infra.',
      'Verifier la connexion Redis avec npm run notifications:redis:ping avant tout bootstrap du module.',
      'Initialiser le runtime Notifications avec les dependances infra locales.',
      'Verifier le healthcheck runtime et l etat des composants actifs.',
      'Executer un cycle global puis relire le registre runtime.',
      'Arreter explicitement le runtime avant toute reconfiguration locale.',
    ];
  }
}
