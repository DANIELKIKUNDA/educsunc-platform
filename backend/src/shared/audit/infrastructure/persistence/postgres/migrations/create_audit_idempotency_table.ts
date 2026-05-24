import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditIdempotencySchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare le stockage idempotent des écritures Audit.
export const createAuditIdempotencyTable: AuditPostgresMigration = {
  nom: 'create_audit_idempotency_table',
  ordre: 40,
  description: "Créer la table d'idempotence Audit.",
  sql: construireCreateTableSql(auditIdempotencySchema),
};
