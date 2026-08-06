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
import {
  isQuotaExceededError,
  OfflineStorageCapacityError,
  storageCapacityService,
} from '../storage/storage-capacity.service';

const MAX_QUEUED_OPERATIONS = 500;
const OPERATION_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

export interface EnqueueOfflineOperationInput {
  operationType: OfflineOperationType;
  payload: unknown;
  idempotencyKey?: string;
  schoolYearId?: string;
}

export interface OfflineQueueIssue {
  id: string;
  status: 'CONFLICT' | 'REJECTED';
  operationLabel: string;
  message: string;
  attempts: number;
  createdAt: string;
}

const OPERATION_LABELS: Record<OfflineOperationType, string> = {
  ENCODER_COTE: 'Encodage de cote',
  MODIFIER_COTE: 'Modification de cote',
};

type ContextProvider = (schoolYearId?: string) => Promise<OfflineTenantContext | null>;
type CapacityGuard = (additionalBytes: number) => Promise<void>;

export class OfflineQueueService {
  public constructor(
    private readonly database: EduSyncLocalDatabase,
    private readonly contextProvider: ContextProvider = readActiveOfflineContext,
    private readonly capacityGuard: CapacityGuard = (bytes) => storageCapacityService.assertCanStore(bytes),
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

    await this.capacityGuard(new TextEncoder().encode(JSON.stringify(input.payload)).byteLength);

    const encrypted = await encryptOfflinePayload(
      this.database,
      context.partitionKey,
      input.payload,
    );
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    try {
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
    } catch (error) {
      if (isQuotaExceededError(error)) throw new OfflineStorageCapacityError();
      throw error;
    }
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

  public async listIssues(): Promise<OfflineQueueIssue[]> {
    const context = await this.contextProvider();
    if (!context) return [];
    const operations = await this.database.operations
      .where('partitionKey')
      .equals(context.partitionKey)
      .filter((operation) => operation.status === 'CONFLICT' || operation.status === 'REJECTED')
      .toArray();
    return operations
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((operation) => ({
        id: operation.id,
        status: operation.status as 'CONFLICT' | 'REJECTED',
        operationLabel: OPERATION_LABELS[operation.operationType],
        message: operation.lastErrorMessage ?? 'Cette operation necessite votre attention.',
        attempts: operation.attempts,
        createdAt: operation.createdAt,
      }));
  }

  public async retryRejected(operationId: string): Promise<void> {
    const operation = await this.database.operations.get(operationId);
    if (!operation || operation.status !== 'REJECTED') return;
    const now = new Date().toISOString();
    await this.database.operations.update(operationId, {
      status: 'RETRY',
      attempts: 0,
      updatedAt: now,
      nextAttemptAt: now,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
    });
    await this.refreshCounters(operation.partitionKey);
  }
}

export const queueService = new OfflineQueueService(offlineDatabase);
