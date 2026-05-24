import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { createAuditAnalyticsDailyTable } from './create_audit_analytics_daily_table';
import { createAuditAppendOnlyGuards } from './create_audit_append_only_guards';
import { createAuditArchivesTable } from './create_audit_archives_table';
import { createAuditCategoriesTable } from './create_audit_categories_table';
import { createAuditEntriesTable } from './create_audit_entries_table';
import { createAuditExportsTable } from './create_audit_exports_table';
import { createAuditForensicLinksTable } from './create_audit_forensic_links_table';
import { createAuditIdempotencyTable } from './create_audit_idempotency_table';
import { createAuditIndexes } from './create_audit_indexes';
import { createAuditProjectionsTimelineTable } from './create_audit_projections_timeline_table';
import { createAuditSyncConflictsTable } from './create_audit_sync_conflicts_table';

export * from './audit-postgres-migration.types';
export * from './migration-helpers';
export * from './create_audit_entries_table';
export * from './create_audit_categories_table';
export * from './create_audit_exports_table';
export * from './create_audit_idempotency_table';
export * from './create_audit_sync_conflicts_table';
export * from './create_audit_archives_table';
export * from './create_audit_projections_timeline_table';
export * from './create_audit_analytics_daily_table';
export * from './create_audit_forensic_links_table';
export * from './create_audit_append_only_guards';
export * from './create_audit_indexes';

// Cette liste ordonnée fournit la séquence officielle des migrations PostgreSQL Audit.
export const auditPostgresMigrations: readonly AuditPostgresMigration[] = [
  createAuditEntriesTable,
  createAuditCategoriesTable,
  createAuditExportsTable,
  createAuditIdempotencyTable,
  createAuditSyncConflictsTable,
  createAuditArchivesTable,
  createAuditProjectionsTimelineTable,
  createAuditAnalyticsDailyTable,
  createAuditForensicLinksTable,
  createAuditAppendOnlyGuards,
  createAuditIndexes,
].sort((gauche, droite) => gauche.ordre - droite.ordre);
