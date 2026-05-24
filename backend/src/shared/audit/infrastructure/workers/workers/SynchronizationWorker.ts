import { AuditSynchronizationEngine } from '../../synchronization';
import { WorkerDependencyFactory } from '../_WorkerDependencyFactory';

export class SynchronizationWorker {
  private readonly engine = new AuditSynchronizationEngine(WorkerDependencyFactory.creerProjectionHandler());

  public async executer(payload: {
    tailleBatch?: number;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
  }): Promise<void> {
    await this.engine.synchroniser(payload);
  }
}
