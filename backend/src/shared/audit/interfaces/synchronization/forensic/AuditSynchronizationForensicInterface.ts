import type { AuditSynchronizationForensicDto } from '../dto';

export class AuditSynchronizationForensicInterface {
  public static creer(sortie?: Partial<AuditSynchronizationForensicDto>): AuditSynchronizationForensicDto {
    return {
      chronologyReelle: sortie?.chronologyReelle ?? true,
      replayMetadata: sortie?.replayMetadata ?? true,
      retryMetadata: sortie?.retryMetadata ?? true,
      conflits: sortie?.conflits ?? true,
      appareils: sortie?.appareils ?? true,
      reconnexions: sortie?.reconnexions ?? true,
    };
  }
}

