import type { AuditArchiveRecord } from '../../../../domain/repositories';

export interface AuditColdStorageForensicMetadata {
  readonly correlationIds: readonly string[];
  readonly requestIds: readonly string[];
  readonly deviceIds: readonly string[];
  readonly acteurIds: readonly string[];
  readonly ressourcesIds: readonly string[];
  readonly contientReplay: boolean;
  readonly contientRetry: boolean;
  readonly contientConflit: boolean;
}

export interface AuditColdStorageTimelineWindow {
  readonly dateActionMin?: string;
  readonly dateActionMax?: string;
  readonly dateArchivageMin?: string;
  readonly dateArchivageMax?: string;
}

export interface AuditColdStoragePackage {
  readonly packageId: string;
  readonly typeArchive: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly totalArchives: number;
  readonly totalAudits: number;
  readonly creeLe: string;
  readonly formatStockage: 'OBJECT_STORAGE' | 'ENCRYPTED_BACKUP' | 'COMPRESSED_ARCHIVE' | 'CLOUD_COLD';
  readonly empreinteCompression: string;
  readonly forensic: AuditColdStorageForensicMetadata;
  readonly chronologie: AuditColdStorageTimelineWindow;
  readonly archives: readonly AuditArchiveRecord[];
  readonly auditEntryIds: readonly string[];
  readonly blob: string;
}

export interface AuditColdStorageSearchFilters {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly typeArchive?: string;
  readonly packageId?: string;
}

export interface AuditColdStoragePreparationResult {
  readonly totalArchives: number;
  readonly totalAudits: number;
  readonly packageId: string;
  readonly formatStockage: AuditColdStoragePackage['formatStockage'];
}

export interface AuditColdStorageRestorationResult {
  readonly packageId: string;
  readonly totalArchivesRestaurees: number;
  readonly totalAuditsRestaurees: number;
}

export interface AuditColdStorageMonitoringReadModel {
  readonly totalPackages: number;
  readonly totalArchives: number;
  readonly totalAudits: number;
  readonly dernierPackageCreeLe?: string;
}

