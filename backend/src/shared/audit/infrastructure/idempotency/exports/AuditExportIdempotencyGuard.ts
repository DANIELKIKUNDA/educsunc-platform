import { AuditDeduplicationService } from '../deduplication/AuditDeduplicationService';
import { AuditIdempotencyKeyBuilder } from '../keys/AuditIdempotencyKeyBuilder';

// Les exports doivent rester regenerables sans creer des doublons involontaires.
export class AuditExportIdempotencyGuard {
  public constructor(
    private readonly deduplication: AuditDeduplicationService = new AuditDeduplicationService(),
    private readonly keyBuilder: AuditIdempotencyKeyBuilder = new AuditIdempotencyKeyBuilder(),
  ) {}

  public async peutExporter(args: {
    exportId: string;
    requestId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): Promise<boolean> {
    const cle = this.keyBuilder.depuisExport(args);
    const decision = await this.deduplication.verifierEtVerrouiller({
      parts: {
        exportId: args.exportId,
        requestId: args.requestId,
        organisationId: args.organisationId,
        ecoleId: args.ecoleId,
        scope: args.scope,
        sourceTraitement: 'EXPORT_AUDIT',
      },
      nature: 'ORIGINAL',
    });

    if (decision.doitTraiter) {
      this.deduplication.liberer(cle);
    }

    return decision.doitTraiter;
  }
}
