import type { AuditWorkerDeadLetterDto } from '../dto';
export class AuditWorkersDeadLetterInterface {
  public static creer(): AuditWorkerDeadLetterDto {
    return { payload: true, erreur: true, chronology: true, tenant: true, forensicMetadata: true };
  }
}

