import type { AlertDto, CapacityDto, DiagnosticDto, IncidentDto, SaturationDto, SystemStateDto } from '.';

// Ce fichier declare le DTO de sortie de tableau de bord Monitoring.

/** Cette interface represente un tableau de bord Monitoring applicatif. */
export interface DashboardMonitoringDto {
  readonly etatSysteme: SystemStateDto;
  readonly alertes: readonly AlertDto[];
  readonly incidents: readonly IncidentDto[];
  readonly diagnostics: readonly DiagnosticDto[];
  readonly capacites: readonly CapacityDto[];
  readonly saturations: readonly SaturationDto[];
}
