import type { AuditForensicRecoveryDto } from '../dto';

export class AuditForensicRecoveryInterface {
  public static creer(investigationId: string): AuditForensicRecoveryDto {
    return {
      investigationId,
      restaure: true,
    };
  }
}

