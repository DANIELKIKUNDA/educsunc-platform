import { ApiError, clientApi, type RequeteApi } from '../../shared/http/api.client';
import { construireEntetesContexteActif } from '../../shared/session/api-context';
import {
  readActiveOfflineContext,
  type OfflineTenantContext,
} from '../context/offline-context';
import {
  offlineDatabase,
  type EduSyncLocalDatabase,
  type OfflineOperationRecord,
} from '../database';
import { networkService } from '../network/network.service';
import { queueService, type OfflineQueueService } from '../queue/queue.service';
import { syncQueueStore } from '../queue/sync-queue.store';
import { decryptOfflinePayload } from '../security/local-crypto.service';
import { buildOfflineReplayRequest } from './offline-operation.contracts';

const MAX_OPERATIONS_PER_CYCLE = 20;
const MAX_RETRIES = 8;
const STALE_SYNCING_MS = 5 * 60 * 1_000;
const MAX_RETRY_DELAY_MS = 15 * 60 * 1_000;

type OfflineTransport = <T>(request: RequeteApi) => Promise<T>;
type ContextProvider = () => Promise<OfflineTenantContext | null>;

function retryDelay(attempt: number): number {
  return Math.min(1_000 * (2 ** Math.max(0, attempt - 1)), MAX_RETRY_DELAY_MS);
}

function errorCode(error: unknown): string {
  if (error instanceof ApiError) return error.code ?? `HTTP_${error.status}`;
  return 'UNEXPECTED_ERROR';
}

function userSafeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'La synchronisation de cette operation a echoue.';
}

function isPermanentRejection(error: unknown): boolean {
  return error instanceof ApiError
    && [400, 403, 404, 422].includes(error.status);
}

function isTemporaryTransportFailure(error: unknown): boolean {
  return error instanceof ApiError
    && (error.status === 0 || error.status === 401 || error.status === 429 || error.status >= 500);
}

function shouldDegradeNetwork(error: unknown): boolean {
  return error instanceof ApiError
    && (error.status === 0 || error.status === 429 || error.status >= 500);
}

export class OfflineSyncService {
  private running: Promise<void> | null = null;

  public constructor(
    private readonly database: EduSyncLocalDatabase,
    private readonly queue: OfflineQueueService,
    private readonly transport: OfflineTransport = (request) => clientApi.envoyer(request),
    private readonly contextProvider: ContextProvider = readActiveOfflineContext,
    private readonly networkStable: () => boolean = () => networkService.online,
    private readonly reportTransportFailure: () => void = () => networkService.reportTransportFailure(),
  ) {}

  public synchronize(): Promise<void> {
    if (this.running) return this.running;
    this.running = this.run().finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async run(): Promise<void> {
    if (!this.networkStable()) return;
    const context = await this.contextProvider();
    if (!context) return;

    syncQueueStore.setSynchronizing(true);
    try {
      await this.recoverInterruptedOperations(context.partitionKey);
      const now = new Date().toISOString();
      const operations = await this.database.operations
        .where('[partitionKey+status]')
        .anyOf([
          [context.partitionKey, 'PENDING'],
          [context.partitionKey, 'RETRY'],
        ])
        .and((operation) => operation.nextAttemptAt <= now)
        .sortBy('createdAt');

      for (const operation of operations.slice(0, MAX_OPERATIONS_PER_CYCLE)) {
        if (!this.networkStable()) break;
        await this.replay(operation, context);
      }
      syncQueueStore.markSynchronized();
    } finally {
      syncQueueStore.setSynchronizing(false);
      await this.queue.refreshCounters(context.partitionKey);
    }
  }

  private async replay(
    operation: OfflineOperationRecord,
    context: OfflineTenantContext,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.database.operations.update(operation.id, {
      status: 'SYNCING',
      updatedAt: now,
    });

    try {
      const payload = await decryptOfflinePayload(
        this.database,
        context.partitionKey,
        operation.encryptedPayload,
        operation.initializationVector,
      );
      const headers = construireEntetesContexteActif({
        organisationId: context.organizationId,
        ecoleId: context.schoolId,
        utilisateurId: context.userId,
      });
      await this.transport(buildOfflineReplayRequest(
        operation.operationType,
        payload,
        headers,
        operation.idempotencyKey,
      ));
      await this.database.operations.delete(operation.id);
    } catch (error) {
      await this.handleReplayError(operation, error);
    }
  }

  private async handleReplayError(
    operation: OfflineOperationRecord,
    error: unknown,
  ): Promise<void> {
    const attempts = operation.attempts + 1;
    const now = new Date();
    const common = {
      attempts,
      updatedAt: now.toISOString(),
      lastErrorCode: errorCode(error),
      lastErrorMessage: userSafeErrorMessage(error),
    };

    if (error instanceof ApiError && error.status === 409) {
      await this.database.transaction('rw', this.database.operations, this.database.conflicts, async () => {
        await this.database.operations.update(operation.id, { ...common, status: 'CONFLICT' });
        await this.database.conflicts.put({
          id: crypto.randomUUID(),
          operationId: operation.id,
          partitionKey: operation.partitionKey,
          operationType: operation.operationType,
          status: 'OPEN',
          message: error.message,
          createdAt: now.toISOString(),
        });
      });
      return;
    }

    if (isPermanentRejection(error) || (!isTemporaryTransportFailure(error) && attempts >= MAX_RETRIES)) {
      await this.database.operations.update(operation.id, { ...common, status: 'REJECTED' });
      return;
    }

    if (shouldDegradeNetwork(error)) this.reportTransportFailure();

    await this.database.operations.update(operation.id, {
      ...common,
      status: 'RETRY',
      nextAttemptAt: new Date(now.getTime() + retryDelay(attempts)).toISOString(),
    });
  }

  private async recoverInterruptedOperations(partitionKey: string): Promise<void> {
    const threshold = new Date(Date.now() - STALE_SYNCING_MS).toISOString();
    const interrupted = await this.database.operations
      .where('[partitionKey+status]')
      .equals([partitionKey, 'SYNCING'])
      .and((operation) => operation.updatedAt < threshold)
      .primaryKeys();
    if (interrupted.length === 0) return;

    const now = new Date().toISOString();
    await this.database.operations.bulkUpdate(interrupted.map((key) => ({
      key,
      changes: { status: 'RETRY', updatedAt: now, nextAttemptAt: now },
    })));
  }
}

export const syncService = new OfflineSyncService(offlineDatabase, queueService);
