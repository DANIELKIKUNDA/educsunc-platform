import type { AuditIdempotencyRegistration } from '../IdempotencyTypes';

export interface AuditRetryDecision {
  readonly autorise: boolean;
  readonly retryCount: number;
  readonly retryLimit: number;
  readonly retryBackoffMs: number;
  readonly historiqueRetry: string[];
}

// Le retry Audit doit rester limite, explicable et stable dans le temps.
export class AuditRetryControlService {
  public evaluer(
    precedent: AuditIdempotencyRegistration | null,
    retryLimit = 5,
    retryBackoffMs = 250,
  ): AuditRetryDecision {
    const retryCount = (precedent?.retryCount ?? 0) + 1;
    const historiqueRetry = [...(precedent?.historiqueRetry ?? []), new Date().toISOString()];

    return {
      autorise: retryCount <= retryLimit,
      retryCount,
      retryLimit,
      retryBackoffMs,
      historiqueRetry,
    };
  }
}
