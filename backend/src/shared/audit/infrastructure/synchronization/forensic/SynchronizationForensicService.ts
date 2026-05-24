import { OfflineAuditForensicService } from '../../offline';
import type { OfflineAuditForensicSnapshot } from '../../offline';

// Le forensic sync doit reconstruire appareils, replay, retry, conflits et chronologies.
export class SynchronizationForensicService {
  public constructor(
    private readonly forensic: OfflineAuditForensicService = new OfflineAuditForensicService(),
  ) {}

  public construire(args: {
    syncId?: string;
    replayId?: string;
    deviceId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): OfflineAuditForensicSnapshot {
    return this.forensic.construireSnapshot(args);
  }
}
