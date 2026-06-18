import type { NotificationContext } from '../../context';
import type {
  SnapshotMonitoringNotification,
  VueSurveillanceFilesNotifications,
} from '../../infrastructure/monitoring';
import type { EntreeJournalObservabiliteNotification } from '../../infrastructure/observability';
import type { ResultatExecutionReplayNotification } from '../../infrastructure/replay';
import type { ResultatExecutionRetryNotification } from '../../infrastructure/retry';
import type { ResultatExecutionWorkerNotification } from '../../infrastructure/workers';

// Ce fichier declare les types partages par le pont d'integration entre Notifications et Monitoring.

/** Cette union represente les sources techniques que l'integration remonte vers le monitoring transverse. */
export type NotificationMonitoringIntegrationSource =
  | 'GENERAL'
  | 'QUEUES'
  | 'WORKERS'
  | 'REPLAY'
  | 'RETRY'
  | 'OBSERVABILITY';

/** Cette interface represente une observation runtime normalisee pour le monitoring transverse. */
export interface NotificationMonitoringObservation {
  readonly source: NotificationMonitoringIntegrationSource;
  readonly niveau: 'INFO' | 'WARN' | 'ERROR';
  readonly message: string;
  readonly notificationContext: NotificationContext;
  readonly donnees: Readonly<Record<string, unknown>>;
  readonly observeLe: Date;
}

/** Cette interface represente l'enregistrement conserve par le publisher local d'integration monitoring. */
export interface NotificationMonitoringIntegrationRecord {
  readonly source: NotificationMonitoringIntegrationSource;
  readonly niveau: NotificationMonitoringObservation['niveau'];
  readonly message: string;
  readonly notificationId: string;
  readonly canal: NotificationContext['canal'];
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly queueName?: string;
  readonly workerId?: string;
  readonly replayId?: string;
  readonly retryCount?: number;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly provider?: string;
  readonly donnees: Readonly<Record<string, unknown>>;
  readonly observeLe: string;
}

/** Cette interface represente la vue de monitoring d'integration des files Notifications. */
export interface NotificationQueueMonitoringSnapshot {
  readonly observationTechnique?: VueSurveillanceFilesNotifications;
  readonly totalObservationsQueues: number;
  readonly totalSaturations: number;
  readonly totalDeadLettersSignales: number;
}

/** Cette interface represente la vue de monitoring d'integration des workers Notifications. */
export interface NotificationWorkerMonitoringSnapshot {
  readonly derniersCycles: readonly ResultatExecutionWorkerNotification[];
  readonly totalCycles: number;
  readonly totalJobsTraites: number;
  readonly totalEchecs: number;
}

/** Cette interface represente la vue de monitoring d'integration des rejeux Notifications. */
export interface NotificationReplayMonitoringSnapshot {
  readonly derniersResultats: readonly ResultatExecutionReplayNotification[];
  readonly totalRejeux: number;
  readonly totalRejeuxEnEchec: number;
}

/** Cette interface represente la vue de monitoring d'integration des retries Notifications. */
export interface NotificationRetryMonitoringSnapshot {
  readonly derniersResultats: readonly ResultatExecutionRetryNotification[];
  readonly totalRetries: number;
  readonly totalRetriesEnEchec: number;
}

/** Cette interface represente la vue de monitoring d'integration de l'observabilite Notifications. */
export interface NotificationObservabilityMonitoringSnapshot {
  readonly journalRecent: readonly EntreeJournalObservabiliteNotification[];
  readonly totalEntreesJournal: number;
  readonly totalWarnings: number;
  readonly totalErrors: number;
  readonly totalCorrelationsObservees: number;
}

/** Cette interface represente le snapshot global du pont d'integration monitoring Notifications. */
export interface NotificationMonitoringIntegrationSnapshot {
  readonly technique?: SnapshotMonitoringNotification;
  readonly observations: readonly NotificationMonitoringIntegrationRecord[];
  readonly queues: NotificationQueueMonitoringSnapshot;
  readonly workers: NotificationWorkerMonitoringSnapshot;
  readonly replay: NotificationReplayMonitoringSnapshot;
  readonly retry: NotificationRetryMonitoringSnapshot;
  readonly observability: NotificationObservabilityMonitoringSnapshot;
}
