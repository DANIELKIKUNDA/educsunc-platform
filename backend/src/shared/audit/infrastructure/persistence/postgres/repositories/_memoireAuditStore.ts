import type {
  AuditAnalyticsSnapshot,
  AuditArchiveRecord,
  AuditExportRecord,
  AuditIdempotencyRecord,
  AuditProjectionRecord,
  AuditSyncConflictRecord,
} from '../../../../domain/repositories';
import type { AuditEntry } from '../../../../domain/aggregates';

type AuditForensicLinkRecord = {
  auditEntrySource: string;
  auditEntryCible: string;
  typeRelation: string;
};

type AuditColdStoragePackageRecord = {
  packageId: string;
  typeArchive: string;
  organisationId?: string;
  ecoleId?: string;
  scope?: string;
  totalArchives: number;
  totalAudits: number;
  creeLe: string;
  formatStockage: 'OBJECT_STORAGE' | 'ENCRYPTED_BACKUP' | 'COMPRESSED_ARCHIVE' | 'CLOUD_COLD';
  empreinteCompression: string;
  forensic: {
    correlationIds: string[];
    requestIds: string[];
    deviceIds: string[];
    acteurIds: string[];
    ressourcesIds: string[];
    contientReplay: boolean;
    contientRetry: boolean;
    contientConflit: boolean;
  };
  chronologie: {
    dateActionMin?: string;
    dateActionMax?: string;
    dateArchivageMin?: string;
    dateArchivageMax?: string;
  };
  archives: AuditArchiveRecord[];
  auditEntryIds: string[];
  blob: string;
};

type MemoireAuditStore = {
  auditEntries: Map<string, AuditEntry>;
  auditEntryOrder: string[];
  auditEntryIdsByCorrelation: Map<string, string[]>;
  auditEntryIdsByRequest: Map<string, string[]>;
  auditExports: Map<string, AuditExportRecord>;
  auditArchives: Map<string, AuditArchiveRecord>;
  auditAnalyticsSnapshots: Map<string, AuditAnalyticsSnapshot>;
  auditProjections: Map<string, AuditProjectionRecord>;
  auditIdempotency: Map<string, AuditIdempotencyRecord>;
  auditSyncConflicts: Map<string, AuditSyncConflictRecord>;
  auditForensicLinks: AuditForensicLinkRecord[];
  auditColdStoragePackages: Map<string, AuditColdStoragePackageRecord>;
};

const stockage: MemoireAuditStore = {
  auditEntries: new Map<string, AuditEntry>(),
  auditEntryOrder: [],
  auditEntryIdsByCorrelation: new Map<string, string[]>(),
  auditEntryIdsByRequest: new Map<string, string[]>(),
  auditExports: new Map<string, AuditExportRecord>(),
  auditArchives: new Map<string, AuditArchiveRecord>(),
  auditAnalyticsSnapshots: new Map<string, AuditAnalyticsSnapshot>(),
  auditProjections: new Map<string, AuditProjectionRecord>(),
  auditIdempotency: new Map<string, AuditIdempotencyRecord>(),
  auditSyncConflicts: new Map<string, AuditSyncConflictRecord>(),
  auditForensicLinks: [],
  auditColdStoragePackages: new Map<string, AuditColdStoragePackageRecord>(),
};

// Ce store memoire centralise l'etat technique minimal des repositories Audit.
export function obtenirMemoireAuditStore(): MemoireAuditStore {
  return stockage;
}
