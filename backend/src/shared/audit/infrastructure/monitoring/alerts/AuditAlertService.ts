import { AuditExportMonitoringService } from '../../exports';
import { SynchronizationMonitoringService } from '../../synchronization';
import { OfflineAuditMonitoringService } from '../../offline';
import { AuditIdempotencyMonitoringService } from '../../idempotency';
import { obtenirAuditEventMemoryStore } from '../../event-bus';
import { AuditQueueMonitoringService } from '../queues/AuditQueueMonitoringService';
import { AuditWorkerMonitoringService } from '../../workers';
import type { AuditAlertRecord } from '../MonitoringTypes';

// Les alertes doivent être actionnables, précises et contextualisées.
export class AuditAlertService {
  public constructor(
    private readonly exportsMonitoring: AuditExportMonitoringService = new AuditExportMonitoringService(),
    private readonly synchronizationMonitoring: SynchronizationMonitoringService = new SynchronizationMonitoringService(),
    private readonly offlineMonitoring: OfflineAuditMonitoringService = new OfflineAuditMonitoringService(),
    private readonly idempotencyMonitoring: AuditIdempotencyMonitoringService = new AuditIdempotencyMonitoringService(),
    private readonly queues: AuditQueueMonitoringService = new AuditQueueMonitoringService(),
    private readonly workers: AuditWorkerMonitoringService = new AuditWorkerMonitoringService(),
  ) {}

  public detecter(): AuditAlertRecord[] {
    const alerts: AuditAlertRecord[] = [];
    const exports = this.exportsMonitoring.obtenirSnapshot();
    const sync = this.synchronizationMonitoring.obtenirSnapshot();
    const offline = this.offlineMonitoring.obtenirSnapshot();
    const idempotency = this.idempotencyMonitoring.obtenirSnapshot();
    const queues = this.queues.obtenirSnapshot();
    const workers = this.workers.obtenirSnapshot();
    const bus = obtenirAuditEventMemoryStore();

    if (bus.deadLetters.length > 0) {
      alerts.push({ code: 'DEAD_LETTER_DETECTED', severite: 'CRITIQUE', message: 'Des événements audit sont en dead-letter.', contexte: { total: bus.deadLetters.length } });
    }
    if (offline.totalConflits > 0) {
      alerts.push({ code: 'SYNC_CONFLICTS', severite: 'AVERTISSEMENT', message: 'Des conflits de synchronisation audit sont présents.', contexte: { total: offline.totalConflits } });
    }
    if (idempotency.totalCollisions > 0) {
      alerts.push({ code: 'IDEMPOTENCY_COLLISIONS', severite: 'AVERTISSEMENT', message: 'Des collisions idempotentes ont été détectées.', contexte: { total: idempotency.totalCollisions } });
    }
    if (exports.totalMassifs > 0) {
      alerts.push({ code: 'MASSIVE_EXPORTS', severite: 'AVERTISSEMENT', message: 'Des exports massifs audit ont été générés.', contexte: { total: exports.totalMassifs } });
    }
    if (sync.totalRetries > 50) {
      alerts.push({ code: 'RETRY_EXCESSIF', severite: 'CRITIQUE', message: 'Le volume de retry audit devient anormal.', contexte: { total: sync.totalRetries } });
    }
    if (queues.backlogOffline > 100) {
      alerts.push({ code: 'QUEUE_BACKLOG_ELEVE', severite: 'CRITIQUE', message: 'La backlog offline audit devient élevée.', contexte: { backlog: queues.backlogOffline } });
    }
    if (workers.failureRate > 0.3) {
      alerts.push({ code: 'WORKER_FAILURE_RATE', severite: 'CRITIQUE', message: 'Le taux d échec workers audit est dégradé.', contexte: { failureRate: workers.failureRate } });
    }
    if (workers.retryRate > 0.5) {
      alerts.push({ code: 'WORKER_RETRY_STORM', severite: 'AVERTISSEMENT', message: 'Une tempête de retry workers audit est détectée.', contexte: { retryRate: workers.retryRate } });
    }

    return alerts;
  }
}
