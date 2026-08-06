import { offlineDatabase, type EduSyncLocalDatabase } from '../database';
import { queueService, type OfflineQueueService } from '../queue/queue.service';

export class OfflineConflictService {
  public constructor(
    private readonly database: EduSyncLocalDatabase,
    private readonly queue: OfflineQueueService,
  ) {}

  public async discard(operationId: string): Promise<void> {
    const operation = await this.database.operations.get(operationId);
    if (!operation || operation.status !== 'CONFLICT') return;

    const now = new Date().toISOString();
    await this.database.transaction('rw', this.database.operations, this.database.conflicts, async () => {
      await this.database.operations.delete(operationId);
      const conflict = await this.database.conflicts.where('operationId').equals(operationId).first();
      if (conflict) {
        await this.database.conflicts.update(conflict.id, { status: 'RESOLVED', resolvedAt: now });
      }
    });
    await this.queue.refreshCounters(operation.partitionKey);
  }

  public async retry(operationId: string): Promise<void> {
    const operation = await this.database.operations.get(operationId);
    if (!operation || operation.status !== 'CONFLICT') return;

    const now = new Date().toISOString();
    await this.database.transaction('rw', this.database.operations, this.database.conflicts, async () => {
      await this.database.operations.update(operationId, {
        status: 'RETRY',
        updatedAt: now,
        nextAttemptAt: now,
        lastErrorCode: undefined,
        lastErrorMessage: undefined,
      });
      const conflict = await this.database.conflicts.where('operationId').equals(operationId).first();
      if (conflict) {
        await this.database.conflicts.update(conflict.id, { status: 'RESOLVED', resolvedAt: now });
      }
    });
    await this.queue.refreshCounters(operation.partitionKey);
  }
}

export const conflictService = new OfflineConflictService(offlineDatabase, queueService);
