import { AuditExportExpirationService } from '../../exports';

// Les exports ont leurs propres règles de retention et d expiration.
export class AuditRetentionExportService {
  public constructor(
    private readonly expiration: AuditExportExpirationService = new AuditExportExpirationService(),
  ) {}

  public async nettoyerExportsExpires(): Promise<number> {
    return this.expiration.nettoyer();
  }
}
