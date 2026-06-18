// Ce fichier expose un runbook local de recovery pour le module Notifications.

/** Cette classe fournit les etapes de recovery local du moteur Notifications. */
export class RunbookRecoveryNotifications {
  /** Cette methode retourne les etapes simples de recovery et de verification post-incident. */
  public listerEtapes(): readonly string[] {
    return [
      'Lancer une passe globale de recovery pour files, stockage, providers et DLQ.',
      'Verifier les providers recuperables et les files encore saturees.',
      'Relancer uniquement les dead letters necessaires au replay.',
      'Rejouer un healthcheck complet et conserver le diagnostic runtime final.',
    ];
  }
}
