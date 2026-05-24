import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditArchivesSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare l'archivage logique Audit.
export const createAuditArchivesTable: AuditPostgresMigration = {
  nom: 'create_audit_archives_table',
  ordre: 60,
  description: "Créer la table d'archivage logique Audit.",
  sql: construireCreateTableSql(auditArchivesSchema),
};
