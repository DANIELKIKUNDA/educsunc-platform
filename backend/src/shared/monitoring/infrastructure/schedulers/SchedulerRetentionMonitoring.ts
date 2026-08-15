import type { RapportRetentionMonitoring, ServiceRetentionMonitoringPostgres } from '../retention';

/** Planificateur Monitoring: l'intervalle ne declenche aucune purge implicite. */
export class SchedulerRetentionMonitoring {
  public constructor(private readonly service?: ServiceRetentionMonitoringPostgres) {}

  public planifier(): { readonly nom: string; readonly intervalleMillisecondes: number; readonly executionAutomatique: false } {
    return { nom: 'scheduler-retention', intervalleMillisecondes: 3_600_000, executionAutomatique: false };
  }

  /** Une execution doit etre demandee explicitement par l'orchestrateur d'exploitation. */
  public async executerMaintenant(): Promise<RapportRetentionMonitoring> {
    if (!this.service) throw new Error('Service de retention Monitoring non configure.');
    return this.service.executer();
  }
}
