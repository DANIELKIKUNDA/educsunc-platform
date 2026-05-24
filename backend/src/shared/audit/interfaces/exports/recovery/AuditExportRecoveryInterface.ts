import type { AuditExportRecoveryDto } from '../dto';

// Cette interface expose la restauration eventuelle d un export Audit.
export class AuditExportRecoveryInterface {
  public static creer(exportId: string): AuditExportRecoveryDto {
    return {
      exportId,
      restaure: true,
    };
  }
}

