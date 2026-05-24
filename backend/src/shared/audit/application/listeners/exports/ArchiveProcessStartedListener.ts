import { ExportAuditHandler } from '../../handlers/commands/ExportAuditHandler';
import type { AuditExportQuery } from '../../dto/queries/AuditExportQuery';

// Ce listener traduit un evenement transverse en intention applicative Audit.
export class ArchiveProcessStartedListener {
  constructor(private readonly handler: ExportAuditHandler) {}

  public async ecouter(evenement: AuditExportQuery): Promise<void> {
    await this.handler.executer(evenement);
  }
}
