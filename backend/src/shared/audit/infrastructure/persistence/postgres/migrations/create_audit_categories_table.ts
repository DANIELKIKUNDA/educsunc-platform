import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditCategoriesSchema } from '../schemas';
import { construireCreateTableSql } from './migration-helpers';

// Cette migration declare les categories multiples d'une entree Audit.
export const createAuditCategoriesTable: AuditPostgresMigration = {
  nom: 'create_audit_categories_table',
  ordre: 20,
  description: 'Créer le support des catégories multiples des audits.',
  sql: construireCreateTableSql(auditCategoriesSchema),
};
