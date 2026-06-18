// Ce fichier declare le scheduler local des capacites Monitoring.

/** Cette classe represente le scheduler local des capacites. */
export class SchedulerCapacityMonitoring {
  /** Cette methode retourne un plan local simple d execution. */
  public planifier(): { readonly nom: string; readonly intervalleMillisecondes: number } {
    return { nom: 'scheduler-capacity', intervalleMillisecondes: 300_000 };
  }
}
