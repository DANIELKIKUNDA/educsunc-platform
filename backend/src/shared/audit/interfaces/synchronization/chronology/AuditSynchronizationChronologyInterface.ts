import type { AuditSynchronizationChronologyDto } from '../dto';

export class AuditSynchronizationChronologyInterface {
  public static creer(sortie?: Partial<AuditSynchronizationChronologyDto>): AuditSynchronizationChronologyDto {
    return {
      dateAction: sortie?.dateAction,
      dateCreationLocale: sortie?.dateCreationLocale,
      dateSync: sortie?.dateSync,
      replayTimestamp: sortie?.replayTimestamp,
      retryTimestamp: sortie?.retryTimestamp,
      insertionTimestamp: sortie?.insertionTimestamp,
    };
  }
}

