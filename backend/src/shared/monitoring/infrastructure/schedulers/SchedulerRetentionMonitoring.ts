// Ce fichier declare le scheduler local de retention Monitoring.

/** Cette classe represente le scheduler local de retention. */
export class SchedulerRetentionMonitoring {
  /** Cette methode retourne un plan local simple d execution. */
  public planifier(): { readonly nom: string; readonly intervalleMillisecondes: number } {
    return { nom: 'scheduler-retention', intervalleMillisecondes: 3_600_000 };
  }
}
