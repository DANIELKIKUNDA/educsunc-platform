// Ce fichier declare le scheduler local des diagnostics Monitoring.

/** Cette classe represente le scheduler local des diagnostics. */
export class SchedulerDiagnosticsMonitoring {
  /** Cette methode retourne un plan local simple d execution. */
  public planifier(): { readonly nom: string; readonly intervalleMillisecondes: number } {
    return { nom: 'scheduler-diagnostics', intervalleMillisecondes: 120_000 };
  }
}
