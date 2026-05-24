import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicMaskedDto } from '../dto';

export class AuditForensicMaskingInterface {
  public static creer(sortie: AuditForensicOutput): AuditForensicMaskedDto {
    return {
      ...sortie,
      masque: true,
    };
  }
}

