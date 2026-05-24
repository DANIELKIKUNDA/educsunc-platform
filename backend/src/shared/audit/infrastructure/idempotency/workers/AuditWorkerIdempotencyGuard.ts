import { AuditDeduplicationService } from '../deduplication/AuditDeduplicationService';

// Ce garde couvre les workers paralleles et les reprises apres crash ou timeout.
export class AuditWorkerIdempotencyGuard {
  public constructor(
    private readonly deduplication: AuditDeduplicationService = new AuditDeduplicationService(),
  ) {}

  public async peutTraiter(args: {
    operationId: string;
    requestId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): Promise<boolean> {
    const decision = await this.deduplication.verifierEtVerrouiller({
      parts: {
        operationId: args.operationId,
        requestId: args.requestId,
        organisationId: args.organisationId,
        ecoleId: args.ecoleId,
        scope: args.scope,
        sourceTraitement: 'WORKER_AUDIT',
      },
      nature: 'ORIGINAL',
    });

    if (decision.doitTraiter) {
      this.deduplication.liberer(decision.cleIdempotence);
    }

    return decision.doitTraiter;
  }
}
