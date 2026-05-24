import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicCorrelationDto } from '../dto';

export class AuditForensicCorrelationInterface {
  public static creer(sortie: AuditForensicOutput): AuditForensicCorrelationDto {
    return {
      investigationId: sortie.investigationId,
      correlations: sortie.correlations,
    };
  }
}

