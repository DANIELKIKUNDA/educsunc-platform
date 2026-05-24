import { reinitialiserSharedEventBus } from 'shared/infrastructure/bus';
import { obtenirMemoireAuditStore } from 'shared/audit/infrastructure/persistence/postgres/repositories/_memoireAuditStore';
import { obtenirAuditEventMemoryStore } from 'shared/audit/infrastructure/event-bus/stores/AuditEventMemoryStore';
import { obtenirAuditConfigurationMemoryStore } from 'shared/audit/infrastructure/configuration';
import { obtenirNotificationAuditMemoryStore } from 'shared/notifications/integration/audit/store/NotificationAuditMemoryStore';
import { obtenirConfigurationAuditMemoryStore } from 'shared/configuration/integration/audit/store/ConfigurationAuditMemoryStore';
import {
  obtenirAuditWorkerQueueMetrics,
  obtenirAuditWorkerQueueStore,
} from 'shared/audit/infrastructure/workers/queues/AuditWorkerQueueStore';
import { obtenirOfflineAuditLocalStore } from 'shared/audit/infrastructure/offline/storage/OfflineAuditLocalStore';

const QUEUES = [
  'PROJECTIONS',
  'EXPORTS',
  'SYNCHRONIZATION',
  'ANALYTICS',
  'RETENTION',
  'MONITORING',
  'FORENSIC',
] as const;

export function reinitialiserEtatAuditTests(): void {
  reinitialiserSharedEventBus();

  const auditStore = obtenirMemoireAuditStore();
  auditStore.auditEntries.clear();
  auditStore.auditEntryOrder.length = 0;
  auditStore.auditEntryIdsByCorrelation.clear();
  auditStore.auditEntryIdsByRequest.clear();
  auditStore.auditExports.clear();
  auditStore.auditArchives.clear();
  auditStore.auditAnalyticsSnapshots.clear();
  auditStore.auditProjections.clear();
  auditStore.auditIdempotency.clear();
  auditStore.auditSyncConflicts.clear();
  auditStore.auditForensicLinks.length = 0;
  auditStore.auditColdStoragePackages.clear();

  const eventStore = obtenirAuditEventMemoryStore();
  eventStore.events.length = 0;
  eventStore.deadLetters.length = 0;
  eventStore.processedEventIds.clear();

  const configurationStore = obtenirAuditConfigurationMemoryStore();
  configurationStore.current.clear();
  configurationStore.history.length = 0;
  configurationStore.cache.clear();
  configurationStore.events.length = 0;

  const notificationsStore = obtenirNotificationAuditMemoryStore();
  notificationsStore.records.length = 0;

  const configAuditStore = obtenirConfigurationAuditMemoryStore();
  configAuditStore.records.length = 0;

  const workerStore = obtenirAuditWorkerQueueStore();
  for (const queueName of QUEUES) {
    const queue = workerStore.queues.get(queueName);
    if (queue) {
      queue.length = 0;
    }
    const metrics = obtenirAuditWorkerQueueMetrics(queueName);
    metrics.enqueued = 0;
    metrics.started = 0;
    metrics.completed = 0;
    metrics.failed = 0;
    metrics.retried = 0;
    metrics.replayed = 0;
    metrics.deadLettered = 0;
    metrics.totalProcessingDurationMs = 0;
    metrics.lastStartedAt = undefined;
    metrics.lastCompletedAt = undefined;
    metrics.lastFailedAt = undefined;
  }
  workerStore.deadLetters.length = 0;
  workerStore.scheduled.length = 0;

  const offlineStore = obtenirOfflineAuditLocalStore();
  offlineStore.queue.clear();
  offlineStore.queueOrder.length = 0;
  offlineStore.cache.clear();
  offlineStore.devices.clear();
  offlineStore.chronology.clear();
  offlineStore.conflicts.clear();
  offlineStore.checkpoints.clear();
  offlineStore.forensicSnapshots.clear();
}

export function creerNotificationContext(overrides: Partial<{
  notificationId: string;
  canal: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WHATSAPP';
  organisationId: string;
  ecoleId: string;
  correlationId: string;
  requestId: string;
  actorId: string;
  queueName: string;
  workerId: string;
  provider: string;
  requestedAt: string;
  previousVersion: string;
}> = {}) {
  return {
    notificationId: overrides.notificationId ?? 'notification-1',
    canal: overrides.canal ?? 'EMAIL',
    organisationId: overrides.organisationId ?? 'org-a',
    ecoleId: overrides.ecoleId ?? 'ecole-a',
    correlationId: overrides.correlationId ?? 'corr-notification',
    requestId: overrides.requestId ?? 'req-notification',
    actorId: overrides.actorId ?? 'user-1',
    queueName: overrides.queueName ?? 'notifications-prioritaires',
    workerId: overrides.workerId ?? 'worker-notification-1',
    provider: overrides.provider ?? 'provider-email',
    requestedAt: overrides.requestedAt ?? '2026-05-24T10:00:00.000Z',
  };
}

export function creerConfigurationScope(overrides: Partial<{
  niveau: 'GLOBAL' | 'ENVIRONNEMENT' | 'ORGANISATION' | 'ECOLE';
  environnement: string;
  organisationId: string;
  ecoleId: string;
}> = {}) {
  return {
    niveau: overrides.niveau ?? 'ECOLE',
    environnement: overrides.environnement,
    organisationId: overrides.organisationId ?? 'org-a',
    ecoleId: overrides.ecoleId ?? 'ecole-a',
  } as const;
}

export async function attendrePropagationAsync(tours = 3): Promise<void> {
  for (let index = 0; index < tours; index += 1) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}
