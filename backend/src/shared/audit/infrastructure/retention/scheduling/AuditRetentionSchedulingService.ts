import { AuditRetentionOrchestrator } from '../workflow/AuditRetentionOrchestrator';

// La retention se planifie, ne s'exécute pas au hasard dans le runtime.
export class AuditRetentionSchedulingService {
  public constructor(
    private readonly orchestrator: AuditRetentionOrchestrator = new AuditRetentionOrchestrator(),
  ) {}

  public async executerCycle(): Promise<void> {
    await this.orchestrator.executerCycle();
  }
}
