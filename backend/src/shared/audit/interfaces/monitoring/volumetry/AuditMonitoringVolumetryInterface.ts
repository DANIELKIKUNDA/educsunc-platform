import type { AuditMonitoringVolumetryDto } from '../dto';

export class AuditMonitoringVolumetryInterface {
  public static creer(sortie?: Partial<AuditMonitoringVolumetryDto>): AuditMonitoringVolumetryDto {
    return {
      partitions: sortie?.partitions ?? 0,
      exports: sortie?.exports ?? 0,
      queues: sortie?.queues ?? 0,
      forensic: sortie?.forensic ?? 0,
      archives: sortie?.archives ?? 0,
      projections: sortie?.projections ?? 0,
    };
  }
}

