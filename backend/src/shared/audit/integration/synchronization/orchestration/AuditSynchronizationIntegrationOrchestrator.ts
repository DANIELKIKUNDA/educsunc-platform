import type { AuditContext } from '../../../context';
import type { AuditEventPublisher } from '../../event-bus';
import {
  AuditSynchronizationOrchestrator,
  type AuditSynchronizationMergeStrategy,
  type AuditSynchronizationResult,
} from '../../../infrastructure/synchronization';
import { AuditSynchronizationMetadataBuilder } from '../metadata/AuditSynchronizationMetadataBuilder';
import { AuditSynchronizationDeviceBridge } from '../devices/AuditSynchronizationDeviceBridge';
import { AuditSynchronizationChronologyBridge } from '../chronology/AuditSynchronizationChronologyBridge';
import { AuditSynchronizationReplayBridge } from '../replay/AuditSynchronizationReplayBridge';
import { AuditSynchronizationRetryBridge } from '../retry/AuditSynchronizationRetryBridge';
import { AuditSynchronizationConflictBridge } from '../conflicts/AuditSynchronizationConflictBridge';
import { AuditSynchronizationMergeBridge } from '../merge/AuditSynchronizationMergeBridge';
import { AuditSynchronizationRecoveryBridge } from '../recovery/AuditSynchronizationRecoveryBridge';
import { AuditSynchronizationCheckpointStore } from '../checkpoints/AuditSynchronizationCheckpointStore';
import { AuditSynchronizationMonitoringBridge } from '../monitoring/AuditSynchronizationMonitoringBridge';
import { AuditSynchronizationForensicBridge } from '../forensic/AuditSynchronizationForensicBridge';
import type { OfflineAuditQueueItem } from '../../../infrastructure/offline';
import type { AuditSynchronizationCheckpoint } from '../AuditSynchronizationIntegrationTypes';

export class AuditSynchronizationIntegrationOrchestrator {
  private readonly devices = new AuditSynchronizationDeviceBridge();
  private readonly chronology = new AuditSynchronizationChronologyBridge();
  private readonly replay = new AuditSynchronizationReplayBridge();
  private readonly retry = new AuditSynchronizationRetryBridge();
  private readonly conflicts = new AuditSynchronizationConflictBridge();
  private readonly merge = new AuditSynchronizationMergeBridge();
  private readonly recovery = new AuditSynchronizationRecoveryBridge();
  private readonly checkpoints = new AuditSynchronizationCheckpointStore();
  private readonly monitoring = new AuditSynchronizationMonitoringBridge();
  private readonly forensic = new AuditSynchronizationForensicBridge();

  public constructor(
    private readonly publisher: AuditEventPublisher,
    private readonly synchronization: AuditSynchronizationOrchestrator,
  ) {}

  public async signalerReconnexion(auditContext?: AuditContext): Promise<void> {
    this.devices.enregistrerDepuisContexte(auditContext);
    await this.publisher.publier({
      name: 'SyncReconnected',
      payload: {
        ...AuditSynchronizationMetadataBuilder.depuisContext(auditContext),
        offlineDuration: auditContext?.synchronization.offlineDuration,
        deviceMetadata: auditContext?.synchronization.deviceMetadata,
      },
      auditContext,
    });
  }

  public async synchroniser(tailleMax = 100, auditContext?: AuditContext): Promise<AuditSynchronizationResult> {
    const batches = this.synchronization.construireBatches(tailleMax);
    let totalTraites = 0;
    let totalSynchronises = 0;
    let totalEnConflit = 0;
    let totalEnEchec = 0;
    let syncId = auditContext?.synchronization.syncId ?? `sync-${Date.now()}`;

    this.devices.enregistrerDepuisContexte(auditContext);

    for (const batch of batches) {
      await this.publisher.publier({
        name: 'SyncBatchStarted',
        payload: {
          ...AuditSynchronizationMetadataBuilder.depuisContext(auditContext),
          batchId: batch.idBatch,
          taille: batch.taille,
        },
        auditContext,
      });

      for (const currentItem of batch.items) {
        let item = currentItem;
        this.devices.enregistrerDepuisItem(item);
        this.chronology.avantSync(item);

        if (item.replayId) {
          item = this.replay.enrichir(item);
        }
        if (item.retryCount > 0) {
          item = this.retry.enrichir(item, 'SYNC_REPRISE');
        }

        const status = await this.synchronization.traiterItem(item, syncId);
        totalTraites += 1;

        if (status === 'SYNCED') {
          totalSynchronises += 1;
          this.chronology.apresSync(item);
        } else if (status === 'CONFLICT') {
          totalEnConflit += 1;
          const conflict = await this.conflicts.detecter(item, 'Conflit detecte pendant synchronisation.');
          await this.publisher.publier({
            name: 'SyncConflictDetected',
            payload: {
              ...AuditSynchronizationMetadataBuilder.depuisItem(item),
              conflictId: conflict.idConflit,
              typeConflit: conflict.typeConflit,
              description: conflict.description,
              forensic: this.forensic.construireSnapshot(item),
            },
            auditContext,
          });
        } else {
          totalEnEchec += 1;
        }
      }

      this.synchronization.marquerBatchTraite();
      await this.publisher.publier({
        name: 'SyncBatchCompleted',
        payload: {
          ...AuditSynchronizationMetadataBuilder.depuisContext(auditContext),
          batchId: batch.idBatch,
          taille: batch.taille,
          monitoring: this.monitoring.obtenirSnapshot(),
        },
        auditContext,
      });
    }

    return {
      totalTraites,
      totalSynchronises,
      totalEnConflit,
      totalEnEchec,
      syncId,
      batchId: batches.at(-1)?.idBatch,
    };
  }

  public async signalerMerge(
    item: OfflineAuditQueueItem,
    strategy: AuditSynchronizationMergeStrategy,
    auditContext?: AuditContext,
  ): Promise<OfflineAuditQueueItem> {
    const merged = this.merge.fusionner(item, strategy);
    await this.publisher.publier({
      name: 'SyncMergeCompleted',
      payload: {
        ...AuditSynchronizationMetadataBuilder.depuisItem(item),
        mergeStrategy: strategy,
        mergedStatus: merged.statut,
      },
      auditContext,
    });
    return merged;
  }

  public creerCheckpoint(
    auditContext?: AuditContext,
    lastSyncedEventId?: string,
    lastMergeId?: string,
  ): AuditSynchronizationCheckpoint {
    const checkpoint: AuditSynchronizationCheckpoint = {
      checkpointId: `sync-checkpoint-${Date.now()}`,
      auditContext,
      lastSyncedEventId,
      lastMergeId,
      createdAt: new Date().toISOString(),
    };

    this.recovery.checkpoint({
      organisationId: auditContext?.tenant.organisationId,
      ecoleId: auditContext?.tenant.ecoleId,
      scope: auditContext?.tenant.scopes[0],
      deviceId: auditContext?.device.deviceId,
      lastSyncedEventId,
    });
    this.checkpoints.enregistrer(checkpoint);
    return checkpoint;
  }

  public async signalerRecovery(auditContext?: AuditContext): Promise<string[]> {
    const itemIds = this.recovery.reprendre();
    await this.publisher.publier({
      name: 'SyncRecoveryTriggered',
      payload: {
        ...AuditSynchronizationMetadataBuilder.depuisContext(auditContext),
        itemIds,
        checkpoint: this.checkpoints.dernier(),
      },
      auditContext,
    });
    return itemIds;
  }

  public obtenirMonitoring() {
    return this.monitoring.obtenirSnapshot();
  }
}
