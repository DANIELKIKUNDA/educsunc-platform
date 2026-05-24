import type { AuditExportExpirationDto } from '../dto';

// Cette interface expose l etat d expiration public d un export Audit.
export class AuditExportExpirationInterface {
  public static creer(exportId: string, expirationAt?: string): AuditExportExpirationDto {
    return {
      exportId,
      expire: true,
      expirationAt,
    };
  }
}

