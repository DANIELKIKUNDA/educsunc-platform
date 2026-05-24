import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditProjectionsTimelineSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare la projection timeline rapide d'Audit.
export const createAuditProjectionsTimelineTable: AuditPostgresMigration = {
  nom: 'create_audit_projections_timeline_table',
  ordre: 70,
  description: 'Créer la table de projection timeline Audit.',
  sql: construireCreateTableSql(auditProjectionsTimelineSchema),
};
