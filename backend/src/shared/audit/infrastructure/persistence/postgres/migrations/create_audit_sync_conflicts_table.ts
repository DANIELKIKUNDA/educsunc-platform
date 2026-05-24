import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditSyncConflictsSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare l'historisation des conflits de synchronisation.
export const createAuditSyncConflictsTable: AuditPostgresMigration = {
  nom: 'create_audit_sync_conflicts_table',
  ordre: 50,
  description: 'Créer la table de conflits offline/sync Audit.',
  sql: construireCreateTableSql(auditSyncConflictsSchema),
};
