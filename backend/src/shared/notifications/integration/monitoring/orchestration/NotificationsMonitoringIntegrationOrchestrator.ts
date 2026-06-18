import type { NotificationContext } from '../../../context';
import type {
  SnapshotMonitoringNotification,
  VueSurveillanceFilesNotifications,
} from '../../../infrastructure/monitoring';
import type { EntreeJournalObservabiliteNotification } from '../../../infrastructure/observability';
import type { ResultatExecutionReplayNotification } from '../../../infrastructure/replay';
import type { ResultatExecutionRetryNotification } from '../../../infrastructure/retry';
import type { ResultatExecutionWorkerNotification } from '../../../infrastructure/workers';
import type {
  NotificationMonitoringIntegrationSnapshot,
  NotificationMonitoringIntegrationSource,
  NotificationMonitoringObservation,
} from '../NotificationsMonitoringIntegrationTypes';
import { NotificationMonitoringEventMapper } from '../mappers/NotificationMonitoringEventMapper';
import { NotificationObservabilityMonitoringBridge } from '../observability/NotificationObservabilityMonitoringBridge';
import { NotificationMonitoringEventPublisher } from '../publishers/NotificationMonitoringEventPublisher';
import { NotificationQueueMonitoringBridge } from '../queues/NotificationQueueMonitoringBridge';
import { NotificationReplayMonitoringBridge } from '../replay/NotificationReplayMonitoringBridge';
import { NotificationRetryMonitoringBridge } from '../retry/NotificationRetryMonitoringBridge';
import { NotificationWorkerMonitoringBridge } from '../workers/NotificationWorkerMonitoringBridge';

// Ce fichier orchestre le pont entre le moteur Notifications et le monitoring transverse.

/** Cette classe consolide les observations Notifications et les projette vers une vue monitoring unique. */
export class NotificationsMonitoringIntegrationOrchestrator {
  public readonly publisher = new NotificationMonitoringEventPublisher();
  public readonly queues = new NotificationQueueMonitoringBridge();
  public readonly workers = new NotificationWorkerMonitoringBridge();
  public readonly replay = new NotificationReplayMonitoringBridge();
  public readonly retry = new NotificationRetryMonitoringBridge();
  public readonly observability = new NotificationObservabilityMonitoringBridge();

  private snapshotTechnique?: SnapshotMonitoringNotification;
  private observationFiles?: VueSurveillanceFilesNotifications;
  private readonly derniersCyclesWorkers: ResultatExecutionWorkerNotification[] = [];
  private readonly derniersResultatsReplay: ResultatExecutionReplayNotification[] = [];
  private readonly derniersResultatsRetry: ResultatExecutionRetryNotification[] = [];
  private readonly journalObservabilite: EntreeJournalObservabiliteNotification[] = [];

  /** Cette methode enregistre une observation manuelle provenant d'un flux Notifications. */
  public enregistrerObservation(params: {
    readonly source: NotificationMonitoringIntegrationSource;
    readonly message: string;
    readonly notificationContext: NotificationContext;
    readonly niveau?: NotificationMonitoringObservation['niveau'];
    readonly donnees?: Readonly<Record<string, unknown>>;
  }): void {
    const observation = NotificationMonitoringEventMapper.versObservation(params);
    this.publisher.publier(observation);
  }

  /** Cette methode synchronise le dernier snapshot technique du monitoring Notifications. */
  public synchroniserSnapshotTechnique(snapshotTechnique: SnapshotMonitoringNotification): void {
    this.snapshotTechnique = snapshotTechnique;
    this.observationFiles = snapshotTechnique.files;
  }

  /** Cette methode synchronise explicitement la vue files pour les cas ou elle arrive seule. */
  public synchroniserFiles(observationFiles: VueSurveillanceFilesNotifications): void {
    this.observationFiles = observationFiles;
  }

  /** Cette methode memorise un ou plusieurs cycles workers recents. */
  public synchroniserWorkers(
    resultat: ResultatExecutionWorkerNotification | readonly ResultatExecutionWorkerNotification[],
  ): void {
    const cycles = Array.isArray(resultat) ? resultat : [resultat];
    this.remplacerParRecents(this.derniersCyclesWorkers, cycles);
  }

  /** Cette methode memorise un ou plusieurs resultats de rejeu recents. */
  public synchroniserReplay(
    resultat: ResultatExecutionReplayNotification | readonly ResultatExecutionReplayNotification[],
  ): void {
    const resultats = Array.isArray(resultat) ? resultat : [resultat];
    this.remplacerParRecents(this.derniersResultatsReplay, resultats);
  }

  /** Cette methode memorise un ou plusieurs resultats de retry recents. */
  public synchroniserRetry(
    resultat: ResultatExecutionRetryNotification | readonly ResultatExecutionRetryNotification[],
  ): void {
    const resultats = Array.isArray(resultat) ? resultat : [resultat];
    this.remplacerParRecents(this.derniersResultatsRetry, resultats);
  }

  /** Cette methode memorise les dernieres entrees du journal d'observabilite. */
  public synchroniserObservabilite(
    entrees: readonly EntreeJournalObservabiliteNotification[],
  ): void {
    this.journalObservabilite.splice(0, this.journalObservabilite.length, ...entrees.slice(-200));
  }

  /** Cette methode produit le snapshot global du pont Notifications vers Monitoring. */
  public obtenirSnapshot(): NotificationMonitoringIntegrationSnapshot {
    const observations = this.publisher.listerRecents(200);

    return {
      technique: this.snapshotTechnique,
      observations,
      queues: this.queues.construireSnapshot(this.observationFiles, observations),
      workers: this.workers.construireSnapshot(this.derniersCyclesWorkers, observations),
      replay: this.replay.construireSnapshot(this.derniersResultatsReplay, observations),
      retry: this.retry.construireSnapshot(this.derniersResultatsRetry, observations),
      observability: this.observability.construireSnapshot(this.journalObservabilite, observations),
    };
  }

  /** Cette methode conserve uniquement les elements les plus recents d'une liste memoire locale. */
  private remplacerParRecents<TypeElement>(
    cible: TypeElement[],
    elements: readonly TypeElement[],
    retentionMaximale = 50,
  ): void {
    cible.push(...elements);
    if (cible.length > retentionMaximale) {
      cible.splice(0, cible.length - retentionMaximale);
    }
  }
}
