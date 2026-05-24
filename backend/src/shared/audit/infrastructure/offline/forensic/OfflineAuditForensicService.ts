import { OfflineAuditChronologyService } from '../chronology/OfflineAuditChronologyService';
import { OfflineAuditConflictService } from '../conflicts/OfflineAuditConflictService';
import { PersistentOfflineAuditQueue } from '../queue/PersistentOfflineAuditQueue';
import { obtenirOfflineAuditLocalStore } from '../storage/OfflineAuditLocalStore';
import type { OfflineAuditForensicSnapshot } from '../OfflineAuditTypes';

// Le forensic offline doit reconstruire actions, appareils, replay, retry, conflits et sync tardives.
export class OfflineAuditForensicService {
  public constructor(
    private readonly queue: PersistentOfflineAuditQueue = new PersistentOfflineAuditQueue(),
    private readonly chronology: OfflineAuditChronologyService = new OfflineAuditChronologyService(),
    private readonly conflicts: OfflineAuditConflictService = new OfflineAuditConflictService(),
  ) {}

  public construireSnapshot(args: {
    syncId?: string;
    replayId?: string;
    deviceId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): OfflineAuditForensicSnapshot {
    const queueItems = this.queue.lister().filter((item) => {
      if (args.syncId && item.envelope.metadata.syncId !== args.syncId) return false;
      if (args.replayId && item.replayId !== args.replayId) return false;
      if (args.deviceId && item.deviceId !== args.deviceId) return false;
      if (args.organisationId && item.organisationId !== args.organisationId) return false;
      if (args.ecoleId && item.ecoleId !== args.ecoleId) return false;
      if (args.scope && item.scope !== args.scope) return false;
      return true;
    });

    const chronologyIds = this.chronology
      .lister()
      .filter((entry) => queueItems.some((item) => item.envelope.metadata.eventId === entry.eventId))
      .map((entry) => entry.id);

    const snapshot: OfflineAuditForensicSnapshot = {
      syncId: args.syncId,
      replayId: args.replayId,
      deviceId: args.deviceId,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
      queueItemIds: queueItems.map((item) => item.id),
      chronologyIds,
    };

    const id = [
      'offline-forensic',
      args.syncId ?? 'NA',
      args.replayId ?? 'NA',
      args.deviceId ?? 'NA',
      this.conflicts.lister().length.toString(),
    ].join('|');
    obtenirOfflineAuditLocalStore().forensicSnapshots.set(id, snapshot);
    return snapshot;
  }
}
