import type { AuditWorkerRuntimeDto } from '../dto';
export class AuditWorkersRuntimeInterface {
  public static creer(type: AuditWorkerRuntimeDto['type']): AuditWorkerRuntimeDto {
    return { type, idempotent: true, retryable: true, monitorable: true };
  }
}

