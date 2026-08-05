import type { EduSyncLocalDatabase } from '../database';
import { offlineDatabase, type OfflineOperationType } from '../database';
import {
  buildOfflinePartitionKey,
  readActiveOfflineContext,
  type OfflineTenantContext,
} from '../context/offline-context';
import { encryptOfflinePayload } from '../security/local-crypto.service';
import { assertOfflineOperationPayload } from '../sync/offline-operation.contracts';
import { syncQueueStore } from './sync-queue.store';

const MAX_QUEUED_OPERATIONS = 500;
const OPERATION_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

export interface EnqueueOfflineOperationInput {
  operationType: OfflineOperationType;
  payload: unknown;
  idempotencyKey?: string;
  schoolYearId?: string;
}

type ContextProvider = (schoolYearId?: string) => Promise<OfflineTenantContext | null>;

export class OfflineQueueService {
  public constructor(
    private readonly database: EduSyncLocalDatabase,
    private readonly contextProvider: ContextProvider = readActiveOfflineContext,
  ) {}

  public async enqueue(input: EnqueueOfflineOperationInput): Promise<string> {
    assertOfflineOperationPayload(input.operationType, input.payload);
    const activeContext = await this.contextProvider(input.schoolYearId);
    if (!activeContext) {
      throw new Error('Selectionnez une ecole et une annee scolaire avant de travailler hors ligne.');
    }
    const schoolYearId = input.schoolYearId?.trim() || activeContext.schoolYearId;
    const context = schoolYearId === activeContext.schoolYearId
      ? activeContext
      : {
          ...activeContext,
          schoolYearId,
          partitionKey: await buildOfflinePartitionKey({
            userId: activeContext.userId,
            organizationId: activeContext.organizationId,
            schoolId: activeContext.schoolId,
            schoolYearId,
          }),
        };

    await this.purgeExpired();
    const count = await this.database.operations.count();
    if (count >= MAX_QUEUED_OPERATIONS) {
      throw new Error('La file hors ligne est pleine. Reconnectez-vous pour synchroniser les operations en attente.');
    }

    const idempotencyKey = input.idempotencyKey?.trim() || crypto.randomUUID();
    const duplicate = await this.database.operations
      .where('idempotencyKey')
      .equals(idempotencyKey)
      .first();
    if (duplicate) return duplicate.id;

    const encrypted = await encryptOfflinePayload(
      this.database,
      context.partitionKey,
      input.payload,
    );
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await this.database.operations.add({
      id,
      idempotencyKey,
      partitionKey: context.partitionKey,
      operationType: input.operationType,
      ...encrypted,
      status: 'PENDING',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
      nextAttemptAt: now,
    });
    await this.refreshCounters(context.partitionKey);
    return id;
  }

  public async purgeExpired(now = Date.now()): Promise<number> {
    const threshold = new Date(now - OPERATION_RETENTION_MS).toISOString();
    return this.database.operations
      .where('createdAt')
      .below(threshold)
      .and((operation) => operation.status === 'REJECTED')
      .delete();
  }

  public async refreshCounters(partitionKey?: string): Promise<void> {
    const context = partitionKey ? null : await this.contextProvider();
    const activePartition = partitionKey ?? context?.partitionKey;
    if (!activePartition) {
      syncQueueStore.update({ pending: 0, conflicts: 0, rejected: 0 });
      return;
    }

    const operations = await this.database.operations
      .where('partitionKey')
      .equals(activePartition)
      .toArray();
    syncQueueStore.update({
      pending: operations.filter((operation) =>
        operation.status === 'PENDING'
        || operation.status === 'RETRY'
        || operation.status === 'SYNCING').length,
      conflicts: operations.filter((operation) => operation.status === 'CONFLICT').length,
      rejected: operations.filter((operation) => operation.status === 'REJECTED').length,
    });
  }
}

export const queueService = new OfflineQueueService(offlineDatabase);
