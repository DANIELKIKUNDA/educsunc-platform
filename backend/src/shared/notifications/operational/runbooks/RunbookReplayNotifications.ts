// Ce fichier expose un runbook local de replay pour le module Notifications.

/** Cette classe fournit les etapes de rejeu local les plus utiles au support. */
export class RunbookReplayNotifications {
  /** Cette methode retourne les etapes simples de replay local et de reprise DLQ. */
  public listerEtapes(): readonly string[] {
    return [
      'Verifier le diagnostic replay et la taille de la dead-letter queue.',
      'Relancer les dead letters vers la file de replay avec une limite prudente.',
      'Executer un cycle replay puis observer les historiques techniques.',
      'Verifier la chronology et les signaux monitoring apres rejeu.',
    ];
  }
}
