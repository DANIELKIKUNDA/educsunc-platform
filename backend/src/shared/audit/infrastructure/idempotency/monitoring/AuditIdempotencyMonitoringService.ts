import { PostgresAuditIdempotencyStore } from '../stores/PostgresAuditIdempotencyStore';
import type { AuditIdempotencyMonitoringSnapshot } from '../IdempotencyTypes';

// Ce monitoring expose les signaux utiles a la supervision de replay, retry et collisions.
export class AuditIdempotencyMonitoringService {
  public constructor(
    private readonly store: PostgresAuditIdempotencyStore = new PostgresAuditIdempotencyStore(),
  ) {}

  public obtenirSnapshot(): AuditIdempotencyMonitoringSnapshot {
    return this.store.snapshotMonitoring();
  }
}
