import { AuditEventOrchestrator } from './orchestration/AuditEventOrchestrator';
import { AuditEventReplayService } from './replay/AuditEventReplayService';
import { AuditEventRetryService } from './retry/AuditEventRetryService';
import type { PostgresAuditProjectionHandler } from '../persistence/postgres/projections';

// Cette facade expose publication, replay et retry du bus Audit a partir d une orchestration locale.
export class PostgresAuditEventBus {
  public readonly orchestrator: AuditEventOrchestrator;
  public readonly replay: AuditEventReplayService;
  public readonly retry: AuditEventRetryService;

  constructor(projectionHandler: PostgresAuditProjectionHandler) {
    this.orchestrator = new AuditEventOrchestrator(projectionHandler);
    this.replay = new AuditEventReplayService(this.orchestrator.obtenirConsumer());
    this.retry = new AuditEventRetryService(
      this.orchestrator.obtenirConsumer(),
      this.orchestrator.obtenirDeadLetters(),
    );
  }
}

