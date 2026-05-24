import type { AuditArchiveRecord, AuditExportRecord } from '../../../../domain/repositories';
import type { AuditColdStoragePackage } from '../cold-storage';

export type AuditStorageZone = 'ACTIVE' | 'ARCHIVE' | 'COLD_STORAGE' | 'EXPORT' | 'RECOVERY';

export interface AuditStorageDescriptor {
  readonly storageId: string;
  readonly zone: AuditStorageZone;
  readonly type: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly uri: string;
  readonly creeLe: string;
  readonly tenantAware: boolean;
  readonly forensicAware: boolean;
}

export interface AuditArchiveStorageDescriptor extends AuditStorageDescriptor {
  readonly zone: 'ARCHIVE';
  readonly archive: AuditArchiveRecord;
}

export interface AuditColdStorageDescriptor extends AuditStorageDescriptor {
  readonly zone: 'COLD_STORAGE';
  readonly packageColdStorage: AuditColdStoragePackage;
}

export interface AuditExportStorageDescriptor extends AuditStorageDescriptor {
  readonly zone: 'EXPORT';
  readonly exportRecord: AuditExportRecord;
}

export interface AuditForensicStorageDescriptor extends AuditStorageDescriptor {
  readonly correlations: readonly string[];
  readonly requestIds: readonly string[];
  readonly deviceIds: readonly string[];
}

export interface AuditRecoveryStorageReport {
  readonly totalArchivesRestaurees: number;
  readonly totalColdStorageRestaurees: number;
  readonly totalExportsRehydrates: number;
}

