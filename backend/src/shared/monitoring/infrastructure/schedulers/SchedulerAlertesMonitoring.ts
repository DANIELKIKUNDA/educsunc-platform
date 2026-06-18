// Ce fichier declare le scheduler local des alertes Monitoring.

/** Cette classe represente le scheduler local des alertes. */
export class SchedulerAlertesMonitoring {
  /** Cette methode retourne un plan local simple d execution. */
  public planifier(): { readonly nom: string; readonly intervalleMillisecondes: number } {
    return { nom: 'scheduler-alertes', intervalleMillisecondes: 60_000 };
  }
}
