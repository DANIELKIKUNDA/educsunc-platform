import { AnalyticsWorker } from '../workers/AnalyticsWorker';

export class AuditAnalyticsJobRunner {
  private readonly worker = new AnalyticsWorker();

  public async executer(): Promise<void> {
    await this.worker.executer();
  }
}
