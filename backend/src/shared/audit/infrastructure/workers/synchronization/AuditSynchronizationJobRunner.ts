import { SynchronizationWorker } from '../workers/SynchronizationWorker';

export class AuditSynchronizationJobRunner {
  private readonly worker = new SynchronizationWorker();

  public async executer(payload?: {
    tailleBatch?: number;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
  }): Promise<void> {
    await this.worker.executer(payload ?? {});
  }
}
