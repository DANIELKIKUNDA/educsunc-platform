import { MonitoringWorker } from '../workers/MonitoringWorker';

export class AuditMonitoringJobRunner {
  private readonly worker = new MonitoringWorker();

  public async executer(): Promise<void> {
    await this.worker.executer();
  }
}
