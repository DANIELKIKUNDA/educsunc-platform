import type { AuditExportDownloadDto } from '../dto';

// Cette policy interface impose la forme publique minimale d un telechargement export.
export class AuditExportDownloadPolicy {
  public static creer(exportId: string, telechargement: string, expiresAt?: string): AuditExportDownloadDto {
    return {
      exportId,
      telechargement,
      expiresAt,
    };
  }
}

