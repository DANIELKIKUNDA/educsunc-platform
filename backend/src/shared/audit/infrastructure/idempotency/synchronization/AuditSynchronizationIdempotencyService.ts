import { AuditIdempotencyKeyBuilder } from '../keys/AuditIdempotencyKeyBuilder';

export interface AuditSynchronizationFingerprint {
  readonly cleIdempotence: string;
  readonly fingerprint: string;
}

// La synchronisation offline-first doit garder une cle deterministe et un fingerprint stable.
export class AuditSynchronizationIdempotencyService {
  public constructor(
    private readonly keyBuilder: AuditIdempotencyKeyBuilder = new AuditIdempotencyKeyBuilder(),
  ) {}

  public preparer(args: {
    syncId: string;
    replayId?: string;
    requestId?: string;
    operationId?: string;
    organisationId?: string;
    ecoleId?: string;
    scope?: string;
  }): AuditSynchronizationFingerprint {
    const cleIdempotence = this.keyBuilder.depuisSynchronisation({
      syncId: args.syncId,
      replayId: args.replayId,
      requestId: args.requestId,
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      scope: args.scope,
    });

    return {
      cleIdempotence,
      fingerprint: [
        args.syncId,
        args.replayId ?? 'NA',
        args.requestId ?? 'NA',
        args.operationId ?? 'NA',
        args.organisationId ?? 'NA',
        args.ecoleId ?? 'NA',
        args.scope ?? 'NA',
      ].join('|'),
    };
  }
}
