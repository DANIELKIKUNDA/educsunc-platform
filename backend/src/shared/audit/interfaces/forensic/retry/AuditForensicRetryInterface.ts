import type { AuditForensicTimelineDto } from '../dto';
import type { AuditForensicOutput } from 'shared/audit/application';

export class AuditForensicRetryInterface {
  public static creer(sortie: AuditForensicOutput): AuditForensicTimelineDto {
    return {
      investigationId: sortie.investigationId,
      chronology: sortie.timeline ?? [],
      resume: `${sortie.resume} - retry`,
    };
  }
}

