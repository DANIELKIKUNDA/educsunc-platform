import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicTimelineDto } from '../dto';

export class AuditForensicChronologyInterface {
  public static creer(sortie: AuditForensicOutput): AuditForensicTimelineDto {
    return {
      investigationId: sortie.investigationId,
      chronology: sortie.timeline ?? [],
      resume: `${sortie.resume} - chronology`,
    };
  }
}

