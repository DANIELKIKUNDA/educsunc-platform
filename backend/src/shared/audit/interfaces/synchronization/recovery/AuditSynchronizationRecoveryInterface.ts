import type { AuditSynchronizationRecoveryDto } from '../dto';

export class AuditSynchronizationRecoveryInterface {
  public static creer(recoveryId: string): AuditSynchronizationRecoveryDto {
    return {
      recoveryId,
      idempotent: true,
      securise: true,
      tracable: true,
    };
  }
}

