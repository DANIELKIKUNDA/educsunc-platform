import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditExportsSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare l'historique des exports Audit.
export const createAuditExportsTable: AuditPostgresMigration = {
  nom: 'create_audit_exports_table',
  ordre: 30,
  description: "Créer la table d'historisation des exports Audit.",
  sql: construireCreateTableSql(auditExportsSchema),
};
