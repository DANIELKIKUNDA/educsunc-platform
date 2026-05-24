import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditForensicLinksSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare les liens forensic entre événements Audit.
export const createAuditForensicLinksTable: AuditPostgresMigration = {
  nom: 'create_audit_forensic_links_table',
  ordre: 90,
  description: 'Créer la table des liens forensic Audit.',
  sql: construireCreateTableSql(auditForensicLinksSchema),
};
