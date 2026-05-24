import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditEntriesSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare la table append-only principale des entrees Audit.
export const createAuditEntriesTable: AuditPostgresMigration = {
  nom: 'create_audit_entries_table',
  ordre: 10,
  description: "Créer la mémoire append-only principale d'Audit.",
  sql: construireCreateTableSql(auditEntriesSchema),
};
