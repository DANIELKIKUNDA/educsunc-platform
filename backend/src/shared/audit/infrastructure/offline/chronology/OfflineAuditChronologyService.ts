import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditChronologyEntry, OfflineAuditQueueItem } from '../OfflineAuditTypes';

// La chronologie offline distingue toujours action reelle, insertion locale et synchronisation serveur.
export class OfflineAuditChronologyService {
  public enregistrerQueue(item: OfflineAuditQueueItem): OfflineAuditChronologyEntry {
    const entry: OfflineAuditChronologyEntry = {
      id: `chronology-${item.id}`,
      eventId: item.envelope.metadata.eventId,
      syncId: item.envelope.metadata.syncId,
      replayId: item.replayId,
      retryCount: item.retryCount,
      dateActionReelle: item.dateActionReelle,
      dateInsertionLocale: item.dateInsertionLocale,
      organisationId: item.organisationId,
      ecoleId: item.ecoleId,
      scope: item.scope,
      deviceId: item.deviceId,
    };
    obtenirOfflineAuditLocalStore().chronology.set(entry.id, entry);
    return entry;
  }

  public enregistrerSynchronisation(item: OfflineAuditQueueItem, dateSynchronisation: Date): void {
    const id = `chronology-${item.id}`;
    const current = obtenirOfflineAuditLocalStore().chronology.get(id);
    const updated: OfflineAuditChronologyEntry = {
      ...(current ?? {
        id,
        eventId: item.envelope.metadata.eventId,
        syncId: item.envelope.metadata.syncId,
        replayId: item.replayId,
        retryCount: item.retryCount,
        dateActionReelle: item.dateActionReelle,
        dateInsertionLocale: item.dateInsertionLocale,
        organisationId: item.organisationId,
        ecoleId: item.ecoleId,
        scope: item.scope,
        deviceId: item.deviceId,
      }),
      dateSynchronisation: dateSynchronisation.toISOString(),
      dateInsertionServeur: new Date().toISOString(),
    };
    obtenirOfflineAuditLocalStore().chronology.set(id, updated);
  }

  public lister(): OfflineAuditChronologyEntry[] {
    return [...obtenirOfflineAuditLocalStore().chronology.values()];
  }
}
