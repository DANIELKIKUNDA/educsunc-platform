import type { AuditSynchronizationAnalyticsDto } from '../dto';

export class AuditSynchronizationAnalyticsInterface {
  public static creer(sortie?: Partial<AuditSynchronizationAnalyticsDto>): AuditSynchronizationAnalyticsDto {
    return {
      batchs: sortie?.batchs ?? 0,
      incrementaux: sortie?.incrementaux ?? 0,
      checkpoints: sortie?.checkpoints ?? 0,
    };
  }
}

