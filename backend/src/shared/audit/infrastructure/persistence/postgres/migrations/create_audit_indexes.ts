import type { AuditPostgresMigration } from './audit-postgres-migration.types';
import { auditPostgresIndexes } from '../indexes';
import { construireCreateIndexSql } from './migration-helpers';

// Cette migration matérialise les indexes critiques définis par le document.
export const createAuditIndexes: AuditPostgresMigration = {
  nom: 'create_audit_indexes',
  ordre: 110,
  description: "Créer les indexes Audit critiques, composites, forensic, offline, exports et archives.",
  sql: auditPostgresIndexes.map((index) => construireCreateIndexSql(index)).join('\n'),
};
