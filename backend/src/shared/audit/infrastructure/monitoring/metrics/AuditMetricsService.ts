import { PostgresAuditOperationalReader } from '../../persistence/postgres/repositories/PostgresAuditOperationalReader';
import { AuditExportMonitoringService } from '../../exports';
import { SynchronizationMonitoringService } from '../../synchronization';
import { OfflineAuditMonitoringService } from '../../offline';
import { AuditIdempotencyMonitoringService } from '../../idempotency';
import { AuditQueueMonitoringService } from '../queues/AuditQueueMonitoringService';
import { AuditTenantMonitoringService } from '../tenants/AuditTenantMonitoringService';
import { AuditVolumetryMonitoringService } from '../volumetry/AuditVolumetryMonitoringService';
import { AuditWorkerMonitoringService } from '../../workers';
import type { AuditMetricPoint } from '../MonitoringTypes';

// Les métriques donnent une vue quantitative corrélable du comportement runtime.
export class AuditMetricsService {
  public constructor(
    private readonly exportsMonitoring: AuditExportMonitoringService = new AuditExportMonitoringService(),
    private readonly synchronizationMonitoring: SynchronizationMonitoringService = new SynchronizationMonitoringService(),
    private readonly offlineMonitoring: OfflineAuditMonitoringService = new OfflineAuditMonitoringService(),
    private readonly idempotencyMonitoring: AuditIdempotencyMonitoringService = new AuditIdempotencyMonitoringService(),
    private readonly queues: AuditQueueMonitoringService = new AuditQueueMonitoringService(),
    private readonly workers: AuditWorkerMonitoringService = new AuditWorkerMonitoringService(),
    private readonly tenants: AuditTenantMonitoringService = new AuditTenantMonitoringService(),
    private readonly volumetry: AuditVolumetryMonitoringService = new AuditVolumetryMonitoringService(),
    private readonly reader: PostgresAuditOperationalReader = new PostgresAuditOperationalReader(),
  ) {}

  public async collecter(): Promise<AuditMetricPoint[]> {
    const exports = this.exportsMonitoring.obtenirSnapshot();
    const sync = this.synchronizationMonitoring.obtenirSnapshot();
    const offline = this.offlineMonitoring.obtenirSnapshot();
    const idempotency = this.idempotencyMonitoring.obtenirSnapshot();
    const queues = this.queues.obtenirSnapshot();
    const workers = this.workers.obtenirSnapshot();
    const tenants = await this.tenants.obtenirSnapshot();
    const volumetry = await this.volumetry.obtenirSnapshot();
    const horodatage = new Date().toISOString();
    const syncLagMs =
      sync.dernierSyncAt === undefined ? 0 : Math.max(0, Date.now() - new Date(sync.dernierSyncAt).getTime());
    const retention = await this.reader.statistiquesRetentionL5();

    return [
      { nom: 'audit_entries_total', valeur: await this.reader.compterEntrees(), horodatage },
      { nom: 'audit_exports_requested_total', valeur: await this.reader.compterExportsL5(), horodatage },
      { nom: 'audit_exports_completed_total', valeur: await this.reader.compterExportsL5('COMPLETED'), horodatage },
      { nom: 'audit_exports_failed_total', valeur: await this.reader.compterExportsL5('FAILED'), horodatage },
      { nom: 'audit_exports_in_progress', valeur: await this.reader.compterExportsL5('PROCESSING'), horodatage },
      { nom: 'audit_export_duration_seconds', valeur: await this.reader.sommeExportsL5('duree_secondes'), horodatage },
      { nom: 'audit_export_size_bytes', valeur: await this.reader.sommeExportsL5('taille_octets'), horodatage },
      { nom: 'audit_replay_requested_total', valeur: await this.reader.compterReplaysL5(), horodatage },
      { nom: 'audit_replay_success_total', valeur: await this.reader.compterReplaysL5('COMPLETED'), horodatage },
      { nom: 'audit_replay_failed_total', valeur: await this.reader.compterReplaysL5('FAILED'), horodatage },
      { nom: 'audit_replay_duration_seconds', valeur: await this.reader.sommeDureeReplaysL5(), horodatage },
      { nom: 'audit_retention_archived_total', valeur: retention.archives, horodatage },
      { nom: 'audit_retention_deleted_total', valeur: 0, horodatage },
      { nom: 'audit_retention_job_duration_seconds', valeur: retention.dureeSecondes, horodatage },
      { nom: 'audit_integrity_checks_total', valeur: await this.reader.compterVerificationsIntegrite(), horodatage },
      { nom: 'audit_integrity_failures_total', valeur: await this.reader.compterEchecsIntegrite(), horodatage },
      { nom: 'audit_projections_total', valeur: await this.reader.compterDocuments('PROJECTION'), horodatage },
      { nom: 'audit_exports_total', valeur: exports.totalExports, horodatage },
      { nom: 'audit_exports_failures_total', valeur: exports.totalFailures, horodatage },
      { nom: 'audit_sync_total', valeur: sync.totalSynchronisations, horodatage },
      { nom: 'audit_sync_conflicts_total', valeur: sync.totalConflits, horodatage },
      { nom: 'audit_sync_lag_ms', valeur: syncLagMs, horodatage },
      { nom: 'audit_offline_queue_total', valeur: offline.totalQueue, horodatage },
      { nom: 'audit_queue_backlog_total', valeur: queues.backlogOffline, horodatage },
      { nom: 'audit_queue_dead_letter_total', valeur: queues.deadLetter, horodatage },
      { nom: 'audit_worker_backlog_total', valeur: workers.backlog, horodatage },
      { nom: 'audit_worker_failures_total', valeur: workers.deadLetters, horodatage },
      { nom: 'audit_worker_retry_rate', valeur: workers.retryRate, horodatage },
      { nom: 'audit_worker_failure_rate', valeur: workers.failureRate, horodatage },
      { nom: 'audit_replays_total', valeur: offline.totalReplays + idempotency.totalReplays, horodatage },
      { nom: 'audit_retries_total', valeur: offline.totalRetries + idempotency.totalRetries, horodatage },
      { nom: 'audit_dead_letters_total', valeur: idempotency.totalDeadLetters, horodatage },
      { nom: 'audit_tenants_total', valeur: tenants.totalTenants, horodatage },
      { nom: 'audit_cold_storage_packages_total', valeur: volumetry.coldStoragePackages, horodatage },
      {
        nom: 'audit_queue_throughput_total',
        valeur: queues.throughputEvenements,
        horodatage,
        dimensions: { surface: 'event-bus' },
      },
    ];
  }
}
