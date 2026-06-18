import type {
  CapacityDto,
  DiagnosticDto,
  IncidentDto,
  SaturationDto,
  SystemStateDto,
  TraceDto,
} from '.';

// Ce fichier declare le DTO de sortie d observabilite consolidee.

/** Cette interface represente un snapshot d observabilite. */
export interface ObservabilitySnapshotDto {
  readonly etatSysteme: SystemStateDto;
  readonly incidents: readonly IncidentDto[];
  readonly diagnostics: readonly DiagnosticDto[];
  readonly traces: readonly TraceDto[];
  readonly capacites: readonly CapacityDto[];
  readonly saturations: readonly SaturationDto[];
}
