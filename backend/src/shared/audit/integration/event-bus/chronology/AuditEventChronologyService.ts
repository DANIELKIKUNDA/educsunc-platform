import type { AuditContext } from '../../../context';

// Ce service verrouille la chronologie technique transmise au bus pour eviter les faux ordres runtime.
export class AuditEventChronologyService {
  public enrichir(
    payload: Record<string, unknown>,
    auditContext?: AuditContext,
  ): Record<string, unknown> {
    return {
      ...payload,
      chronology: {
        occurredAt: auditContext?.timestamps.recuAt ?? new Date().toISOString(),
        originalActionAt: auditContext?.forensic.chronology.dateActionOriginale,
        replayAt: auditContext?.replay.replayTimestamp,
        retryAt: auditContext?.forensic.retryMetadata.retryTimestamp,
        syncAt: auditContext?.synchronization.chronologyMetadata.syncTimestamp,
      },
    };
  }
}

