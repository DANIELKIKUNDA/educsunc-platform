import type {
  OfflineAuditCacheEntry,
  OfflineAuditChronologyEntry,
  OfflineAuditConflictRecord,
  OfflineAuditDeviceState,
  OfflineAuditForensicSnapshot,
  OfflineAuditQueueItem,
  OfflineAuditRecoveryCheckpoint,
} from '../OfflineAuditTypes';

type OfflineAuditLocalState = {
  queue: Map<string, OfflineAuditQueueItem>;
  queueOrder: string[];
  cache: Map<string, OfflineAuditCacheEntry>;
  devices: Map<string, OfflineAuditDeviceState>;
  chronology: Map<string, OfflineAuditChronologyEntry>;
  conflicts: Map<string, OfflineAuditConflictRecord>;
  checkpoints: Map<string, OfflineAuditRecoveryCheckpoint>;
  forensicSnapshots: Map<string, OfflineAuditForensicSnapshot>;
};

const state: OfflineAuditLocalState = {
  queue: new Map<string, OfflineAuditQueueItem>(),
  queueOrder: [],
  cache: new Map<string, OfflineAuditCacheEntry>(),
  devices: new Map<string, OfflineAuditDeviceState>(),
  chronology: new Map<string, OfflineAuditChronologyEntry>(),
  conflicts: new Map<string, OfflineAuditConflictRecord>(),
  checkpoints: new Map<string, OfflineAuditRecoveryCheckpoint>(),
  forensicSnapshots: new Map<string, OfflineAuditForensicSnapshot>(),
};

// Ce store local simule un support persistant hors RAM serveur definitive pour le mode offline-first.
export function obtenirOfflineAuditLocalStore(): OfflineAuditLocalState {
  return state;
}
