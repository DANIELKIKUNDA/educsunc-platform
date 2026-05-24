import type { AuditPostgresIndexDefinition } from './audit-postgres-index.types';
import { auditArchivesIndexes } from './audit-archives.indexes';
import { auditEntriesIndexes } from './audit-entries.indexes';
import { auditExportsIndexes } from './audit-exports.indexes';
import { auditForensicLinksIndexes } from './audit-forensic-links.indexes';

export * from './audit-postgres-index.types';
export * from './audit-entries.indexes';
export * from './audit-exports.indexes';
export * from './audit-forensic-links.indexes';
export * from './audit-archives.indexes';

// Cette liste centralise l'indexation officielle audit en attendant le bloc migrations SQL.
export const auditPostgresIndexes: readonly AuditPostgresIndexDefinition[] = [
  ...auditEntriesIndexes,
  ...auditExportsIndexes,
  ...auditForensicLinksIndexes,
  ...auditArchivesIndexes,
];
