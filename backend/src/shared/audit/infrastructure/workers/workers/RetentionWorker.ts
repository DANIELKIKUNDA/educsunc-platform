import { AuditRetentionOrchestrator } from '../../retention';

export class RetentionWorker {
  private readonly orchestrator = new AuditRetentionOrchestrator();

  public async executer(payload?: { reference?: string }): Promise<void> {
    await this.orchestrator.executerCycle(payload?.reference ? new Date(payload.reference) : new Date());
  }
}
