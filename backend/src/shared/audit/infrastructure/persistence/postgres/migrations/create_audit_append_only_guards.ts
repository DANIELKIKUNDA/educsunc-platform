import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import {
  auditAnalyticsDailySchema,
  auditArchivesSchema,
  auditCategoriesSchema,
  auditEntriesSchema,
  auditExportsSchema,
  auditForensicLinksSchema,
  auditIdempotencySchema,
  auditProjectionsTimelineSchema,
  auditSyncConflictsSchema,
} from '../schemas';
import { construireAppendOnlyGuardSql } from './migration-helpers';

const tablesAppendOnly = [
  auditEntriesSchema,
  auditCategoriesSchema,
  auditExportsSchema,
  auditIdempotencySchema,
  auditSyncConflictsSchema,
  auditArchivesSchema,
  auditProjectionsTimelineSchema,
  auditAnalyticsDailySchema,
  auditForensicLinksSchema,
].filter((schema) => schema.appendOnly);

// Cette migration protège physiquement l'immuabilité append-only par trigger PostgreSQL.
export const createAuditAppendOnlyGuards: AuditPostgresMigration = {
  nom: 'create_audit_append_only_guards',
  ordre: 100,
  description: "Créer la fonction et les triggers d'interdiction UPDATE/DELETE sur les tables append-only Audit.",
  sql: [
    'CREATE OR REPLACE FUNCTION audit_reject_append_only_mutation()',
    'RETURNS trigger AS $$',
    'BEGIN',
    "  RAISE EXCEPTION 'Append-only violation on %', TG_TABLE_NAME;",
    'END;',
    '$$ LANGUAGE plpgsql;',
    '',
    ...tablesAppendOnly.map((schema) => construireAppendOnlyGuardSql(schema.table, 'audit_reject_append_only_mutation')),
  ].join('\n\n'),
};
