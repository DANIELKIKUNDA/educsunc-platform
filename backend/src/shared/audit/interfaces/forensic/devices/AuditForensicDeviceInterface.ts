import type { AuditForensicOutput } from 'shared/audit/application';
import type { AuditForensicDeviceDto } from '../dto';

export class AuditForensicDeviceInterface {
  public static creer(sortie: AuditForensicOutput, deviceId?: string): AuditForensicDeviceDto {
    return {
      investigationId: sortie.investigationId,
      deviceId,
      resume: sortie.resume,
    };
  }
}

