import type { AuditContext } from '../../../context';

// Ce propagateur preserve les metadonnees forensic indispensables aux investigations distribuees.
export class AuditEventForensicPropagator {
  public enrichir(payload: Record<string, unknown>, auditContext?: AuditContext): Record<string, unknown> {
    if (!auditContext) {
      return payload;
    }

    return {
      ...payload,
      forensic: {
        requestId: auditContext.requestId,
        correlationId: auditContext.correlationId,
        replayMetadata: auditContext.replay,
        retryMetadata: auditContext.retry,
        syncMetadata: auditContext.synchronization,
        deviceMetadata: auditContext.device,
      },
    };
  }
}

