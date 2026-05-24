import type { AuditSynchronizationReplayDto } from '../dto';
import { AuditSynchronizationChronologyInterface } from '../chronology/AuditSynchronizationChronologyInterface';

export class AuditSynchronizationReplayInterface {
  public static creer(sortie?: Partial<AuditSynchronizationReplayDto>): AuditSynchronizationReplayDto {
    return {
      replaySource: sortie?.replaySource,
      replayReason: sortie?.replayReason,
      correlationId: sortie?.correlationId,
      chronology: AuditSynchronizationChronologyInterface.creer(sortie?.chronology),
    };
  }
}

