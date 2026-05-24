import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicSessionDto } from '../dto';

export class AuditForensicSessionInterface {
  public static creer(sortie: AuditForensicOutput, sessionId?: string): AuditForensicSessionDto {
    return {
      investigationId: sortie.investigationId,
      sessionId,
      resume: sortie.resume,
    };
  }
}

