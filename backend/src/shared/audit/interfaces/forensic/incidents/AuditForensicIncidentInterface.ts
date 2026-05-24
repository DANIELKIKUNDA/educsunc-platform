import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicIncidentDto } from '../dto';

export class AuditForensicIncidentInterface {
  public static creer(sortie: AuditForensicOutput, incidentId?: string): AuditForensicIncidentDto {
    return {
      investigationId: sortie.investigationId,
      incidentId,
      resume: sortie.resume,
      indicateurs: sortie.indicateurs,
    };
  }
}

