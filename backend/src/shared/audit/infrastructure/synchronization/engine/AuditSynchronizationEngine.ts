import type { PostgresAuditProjectionHandler } from '../../persistence/postgres/projections';
import { AuditSynchronizationOrchestrator } from '../orchestration/AuditSynchronizationOrchestrator';
import { IncrementalSynchronizationCursorStore } from '../incremental/IncrementalSynchronizationCursorStore';
import type { AuditSynchronizationResult } from '../SynchronizationTypes';

// Le moteur sync orchestre une synchronisation differée, incremental, batchée et event-driven.
export class AuditSynchronizationEngine {
  private readonly orchestrator: AuditSynchronizationOrchestrator;
  private readonly cursors = new IncrementalSynchronizationCursorStore();

  public constructor(projectionHandler: PostgresAuditProjectionHandler) {
    this.orchestrator = new AuditSynchronizationOrchestrator(projectionHandler);
  }

  public async synchroniser(args?: {
    tailleBatch?: number;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
  }): Promise<AuditSynchronizationResult> {
    const syncId = `sync-${Date.now()}`;
    const batches = this.orchestrator.construireBatches(args?.tailleBatch ?? 100);

    let totalTraites = 0;
    let totalSynchronises = 0;
    let totalEnConflit = 0;
    let totalEnEchec = 0;
    let lastEventId: string | undefined;

    for (const batch of batches) {
      this.orchestrator.marquerBatchTraite();
      for (const item of batch.items) {
        totalTraites += 1;
        lastEventId = item.envelope.metadata.eventId;
        const result = await this.orchestrator.traiterItem(item, syncId);
        if (result === 'SYNCED') totalSynchronises += 1;
        else if (result === 'CONFLICT') totalEnConflit += 1;
        else totalEnEchec += 1;
      }
    }

    this.cursors.ecrire({
      organisationId: args?.organisationId,
      ecoleId: args?.ecoleId,
      scope: args?.scope,
      deviceId: args?.deviceId,
      lastSyncedEventId: lastEventId,
      lastSyncedAt: new Date().toISOString(),
    });

    return {
      totalTraites,
      totalSynchronises,
      totalEnConflit,
      totalEnEchec,
      syncId,
      batchId: batches.at(-1)?.idBatch,
    };
  }

  public obtenirCursor(args: {
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
    deviceId?: string;
  }) {
    return this.cursors.lire(args);
  }

  public obtenirMonitoring() {
    return this.orchestrator.obtenirMonitoring().obtenirSnapshot();
  }
}
