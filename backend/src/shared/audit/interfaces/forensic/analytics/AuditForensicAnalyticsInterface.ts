import type { AuditForensicIncidentDto } from '../dto';
import type { AuditForensicOutput } from 'shared/audit/application';

export class AuditForensicAnalyticsInterface {
  public static creer(sortie: AuditForensicOutput): AuditForensicIncidentDto {
    return {
      investigationId: sortie.investigationId,
      resume: `${sortie.resume} - analytics`,
      indicateurs: sortie.indicateurs,
    };
  }
}

