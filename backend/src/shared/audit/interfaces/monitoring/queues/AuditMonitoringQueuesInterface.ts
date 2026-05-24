import type { AuditMonitoringQueueDto } from '../dto';

export class AuditMonitoringQueuesInterface {
  public static creer(sortie?: Partial<AuditMonitoringQueueDto>): AuditMonitoringQueueDto {
    return {
      backlog: sortie?.backlog ?? 0,
      taille: sortie?.taille ?? 0,
      deadLetter: sortie?.deadLetter ?? 0,
      throughput: sortie?.throughput ?? 0,
      attenteMs: sortie?.attenteMs ?? 0,
      saturation: sortie?.saturation ?? false,
    };
  }
}

