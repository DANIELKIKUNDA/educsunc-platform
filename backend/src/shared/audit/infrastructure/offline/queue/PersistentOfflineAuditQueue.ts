import type { AuditEventEnvelope } from '../../event-bus';
import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditQueueItem } from '../OfflineAuditTypes';

export interface EnqueueOfflineAuditInput {
  readonly envelope: AuditEventEnvelope;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly deviceId?: string;
  readonly sourceRuntime?: string;
  readonly dateActionReelle: Date;
  readonly replaySource?: string;
  readonly replayReason?: string;
  readonly retryLimit?: number;
  readonly retryBackoffMs?: number;
}

// La queue offline est persistante, ordonnee et recoverable.
export class PersistentOfflineAuditQueue {
  public enfiler(input: EnqueueOfflineAuditInput): OfflineAuditQueueItem {
    const id = `offline-queue-${input.envelope.metadata.eventId}`;
    const store = obtenirOfflineAuditLocalStore();

    const item: OfflineAuditQueueItem = {
      id,
      envelope: input.envelope,
      organisationId: input.organisationId ?? input.envelope.metadata.organisationId,
      ecoleId: input.ecoleId ?? input.envelope.metadata.ecoleId,
      scope: input.scope ?? input.envelope.metadata.scope,
      deviceId: input.deviceId,
      sourceRuntime: input.sourceRuntime,
      dateActionReelle: input.dateActionReelle.toISOString(),
      dateInsertionLocale: new Date().toISOString(),
      replayId: input.envelope.metadata.replayId,
      replaySource: input.replaySource,
      replayReason: input.replayReason,
      replayTimestamp: input.envelope.metadata.replay ? new Date().toISOString() : undefined,
      retryCount: input.envelope.metadata.retryCount,
      retryLimit: input.retryLimit ?? 5,
      retryBackoffMs: input.retryBackoffMs ?? 250,
      retryHistory: [],
      fingerprint: [
        input.envelope.metadata.eventId,
        input.envelope.metadata.requestId ?? 'NA',
        input.deviceId ?? 'NA',
        input.organisationId ?? input.envelope.metadata.organisationId ?? 'NA',
        input.ecoleId ?? input.envelope.metadata.ecoleId ?? 'NA',
      ].join('|'),
      statut: 'EN_ATTENTE',
    };

    if (!store.queue.has(id)) {
      store.queueOrder.push(id);
    }
    store.queue.set(id, item);
    return item;
  }

  public lister(): OfflineAuditQueueItem[] {
    const store = obtenirOfflineAuditLocalStore();
    return store.queueOrder.map((id) => store.queue.get(id)).filter((value): value is OfflineAuditQueueItem => Boolean(value));
  }

  public listerEnAttente(): OfflineAuditQueueItem[] {
    return this.lister().filter((item) => item.statut === 'EN_ATTENTE' || item.statut === 'ECHEC');
  }

  public retrouver(id: string): OfflineAuditQueueItem | null {
    return obtenirOfflineAuditLocalStore().queue.get(id) ?? null;
  }

  public mettreAJour(item: OfflineAuditQueueItem): void {
    obtenirOfflineAuditLocalStore().queue.set(item.id, item);
  }
}
