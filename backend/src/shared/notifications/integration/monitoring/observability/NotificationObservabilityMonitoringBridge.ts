import type { EntreeJournalObservabiliteNotification } from '../../../infrastructure/observability';
import type {
  NotificationMonitoringIntegrationRecord,
  NotificationObservabilityMonitoringSnapshot,
} from '../NotificationsMonitoringIntegrationTypes';

// Ce fichier transforme le journal d'observabilite Notifications en vue monitoring transverse.

/** Cette classe agrege les entrees du journal d'observabilite pour la supervision partagee. */
export class NotificationObservabilityMonitoringBridge {
  /** Cette methode construit le snapshot d'observabilite a partir du journal et des observations. */
  public construireSnapshot(
    journalRecent: readonly EntreeJournalObservabiliteNotification[],
    observations: readonly NotificationMonitoringIntegrationRecord[],
  ): NotificationObservabilityMonitoringSnapshot {
    const correlations = new Set<string>();

    for (const entree of journalRecent) {
      if (entree.contexte.correlationId) {
        correlations.add(entree.contexte.correlationId);
      }
    }

    for (const observation of observations) {
      if (observation.correlationId) {
        correlations.add(observation.correlationId);
      }
    }

    return {
      journalRecent: [...journalRecent],
      totalEntreesJournal: journalRecent.length,
      totalWarnings: journalRecent.filter((entree) => entree.niveau === 'WARN').length,
      totalErrors:
        journalRecent.filter((entree) => entree.niveau === 'ERROR').length +
        observations.filter((observation) => observation.niveau === 'ERROR').length,
      totalCorrelationsObservees: correlations.size,
    };
  }
}
