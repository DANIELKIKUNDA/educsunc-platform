import { PostgresAuditEventBus } from '../../event-bus';
import type { PostgresAuditProjectionHandler } from '../../persistence/postgres/projections';
import { DeferredOfflineAuditSynchronizationService } from '../../offline';
import type { OfflineAuditQueueItem } from '../../offline';
import { SynchronizationBatchBuilder } from '../batching/SynchronizationBatchBuilder';
import { SynchronizationChronologyService } from '../chronology/SynchronizationChronologyService';
import { SynchronizationConflictResolver } from '../conflicts/SynchronizationConflictResolver';
import { SynchronizationDeviceService } from '../devices/SynchronizationDeviceService';
import { SynchronizationMonitoringService } from '../monitoring/SynchronizationMonitoringService';
import { SynchronizationSecurityGuard } from '../security/SynchronizationSecurityGuard';
import type { AuditSynchronizationBatch } from '../SynchronizationTypes';

// Cette orchestration coordonne queue, batches, publication d evenements et marquage sync.
export class AuditSynchronizationOrchestrator {
  private readonly eventBus: PostgresAuditEventBus;

  public constructor(
    projectionHandler: PostgresAuditProjectionHandler,
    private readonly deferredSync: DeferredOfflineAuditSynchronizationService = new DeferredOfflineAuditSynchronizationService(),
    private readonly batchBuilder: SynchronizationBatchBuilder = new SynchronizationBatchBuilder(),
    private readonly chronology: SynchronizationChronologyService = new SynchronizationChronologyService(),
    private readonly devices: SynchronizationDeviceService = new SynchronizationDeviceService(),
    private readonly conflicts: SynchronizationConflictResolver = new SynchronizationConflictResolver(),
    private readonly monitoring: SynchronizationMonitoringService = new SynchronizationMonitoringService(),
    private readonly security: SynchronizationSecurityGuard = new SynchronizationSecurityGuard(),
  ) {
    this.eventBus = new PostgresAuditEventBus(projectionHandler);
  }

  public construireBatches(tailleMax = 100): AuditSynchronizationBatch[] {
    return this.batchBuilder.construire(this.deferredSync.listerLotsSynchronisables(), tailleMax);
  }

  public async traiterItem(item: OfflineAuditQueueItem, syncId: string): Promise<'SYNCED' | 'CONFLICT' | 'REJECTED'> {
    if (!this.security.valider(item)) {
      return 'REJECTED';
    }

    this.devices.enregistrerPresence({
      deviceId: item.deviceId ?? 'unknown-device',
      sourceRuntime: item.sourceRuntime,
    });
    this.chronology.enregistrerAvantSync(item);

    if (item.statut === 'CONFLIT') {
      await this.conflicts.detecter({
        idQueueItem: item.id,
        description: 'Item deja marque en conflit avant synchronisation.',
        organisationId: item.organisationId,
        ecoleId: item.ecoleId,
        scope: item.scope,
      });
      return 'CONFLICT';
    }

    await this.eventBus.orchestrator.publier('AuditEntrySynced', {
      eventId: item.envelope.metadata.eventId,
      syncId,
      replayId: item.replayId,
      requestId: item.envelope.metadata.requestId,
      organisationId: item.organisationId,
      ecoleId: item.ecoleId,
      scope: item.scope,
      dateAction: item.dateActionReelle,
      retryCount: item.retryCount,
      replay: Boolean(item.replayId),
      auditEntry: item.envelope.payload.auditEntry,
    });

    await this.deferredSync.marquerSynchronise(item.id);
    this.chronology.enregistrerApresSync(item);
    this.devices.marquerSynchronisation(item.deviceId ?? 'unknown-device', true);
    this.monitoring.marquerSynchronisation();
    return 'SYNCED';
  }

  public marquerBatchTraite(): void {
    this.monitoring.marquerBatchTraite();
  }

  public obtenirMonitoring(): SynchronizationMonitoringService {
    return this.monitoring;
  }
}
