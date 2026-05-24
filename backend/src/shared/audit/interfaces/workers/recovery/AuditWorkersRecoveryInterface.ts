import type { AuditWorkerRecoveryDto } from '../dto';
export class AuditWorkersRecoveryInterface {
  public static creer(): AuditWorkerRecoveryDto {
    return { crashWorker: true, redemarrage: true, reconnexion: true, retryMassif: true, replayMassif: true };
  }
}

