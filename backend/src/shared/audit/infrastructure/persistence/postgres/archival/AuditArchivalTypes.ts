import type { AuditArchiveRecord } from '../../../../domain/repositories';

export interface AuditArchiveSearchFilters {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly typeArchive?: string;
  readonly archiveIds?: readonly string[];
}

export interface AuditArchivePreparationPlan {
  readonly reference: string;
  readonly totalArchivables: number;
  readonly totalArchivesExistantes: number;
  readonly totalPurgeables: number;
  readonly archivesCandidates: readonly string[];
}

export interface AuditArchiveRestorationReport {
  readonly totalDemandes: number;
  readonly totalRestaurees: number;
  readonly archiveIdsRestaurees: readonly string[];
}

export interface AuditColdStoragePreparationReport {
  readonly totalCandidates: number;
  readonly totalPrepares: number;
  readonly typeArchive: string;
}

export interface AuditArchiveExportEnvelope {
  readonly exportId: string;
  readonly format: string;
  readonly archives: readonly AuditArchiveRecord[];
  readonly urlTemporaire?: string;
}

