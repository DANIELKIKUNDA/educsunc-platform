import { AuditExportExpirationService } from '../expiration/AuditExportExpirationService';

// Ce pont rattache la vie des exports à leur expiration et à leur nettoyage.
export class AuditExportRetentionBridge {
  public constructor(
    private readonly expiration: AuditExportExpirationService = new AuditExportExpirationService(),
  ) {}

  public async nettoyer(): Promise<number> {
    return this.expiration.nettoyer();
  }
}
