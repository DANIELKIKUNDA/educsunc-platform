import type { AuditSynchronizationConflictDto } from '../dto';

export class AuditSynchronizationConflictsInterface {
  public static creer(sortie?: Partial<AuditSynchronizationConflictDto>): AuditSynchronizationConflictDto {
    return {
      auditId: sortie?.auditId,
      typeConflit: sortie?.typeConflit ?? 'CHRONOLOGIQUE',
      resolution: sortie?.resolution,
      justification: sortie?.justification,
    };
  }
}

