import { RetentionWorker } from '../workers/RetentionWorker';

export class AuditRetentionJobRunner {
  private readonly worker = new RetentionWorker();

  public async executer(reference?: string): Promise<void> {
    await this.worker.executer({ reference });
  }
}
