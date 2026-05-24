import type { AuditPostgresIndexDefinition } from './audit-postgres-index.types';

export const auditArchivesIndexes: readonly AuditPostgresIndexDefinition[] = [
  {
    nom: 'idx_audit_archives_date',
    table: 'audit_archives',
    famille: 'archives',
    methode: 'BTREE',
    colonnes: ['date_archivage'],
    tri: ['DESC'],
    critique: true,
    partitionFriendly: true,
    justification: 'Lecture rapide des archives récentes et préparation du futur cold storage.',
  },
];
