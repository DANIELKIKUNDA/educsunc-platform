import type { AuditSynchronizationRetryDto } from '../dto';

export class AuditSynchronizationRetryInterface {
  public static creer(sortie?: Partial<AuditSynchronizationRetryDto>): AuditSynchronizationRetryDto {
    return {
      retryCount: sortie?.retryCount ?? 0,
      retryHistory: sortie?.retryHistory ?? [],
      retryReason: sortie?.retryReason,
      retryWindow: sortie?.retryWindow,
    };
  }
}

