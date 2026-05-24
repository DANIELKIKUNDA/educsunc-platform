import type { AuditSynchronizationIncrementalDto } from '../dto';

export class AuditSynchronizationIncrementalInterface {
  public static creer(sortie?: Partial<AuditSynchronizationIncrementalDto>): AuditSynchronizationIncrementalDto {
    return {
      chronology: sortie?.chronology ?? true,
      replay: sortie?.replay ?? true,
      retry: sortie?.retry ?? true,
      consistency: sortie?.consistency ?? true,
    };
  }
}

