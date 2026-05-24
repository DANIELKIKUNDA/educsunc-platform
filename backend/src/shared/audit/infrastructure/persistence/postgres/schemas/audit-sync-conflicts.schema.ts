import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema historise les conflits de synchronisation.
export const auditSyncConflictsSchema: AuditPostgresTableSchema = {
  table: 'audit_sync_conflicts',
  mission: 'Historiser les conflits de synchronisation de maniere tracable.',
  zone: 'transactionnelle',
  appendOnly: true,
  colonnes: [
    { nom: 'id_audit_conflict', definitionSql: 'UUID PRIMARY KEY', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'type_conflit', definitionSql: 'VARCHAR(80) NOT NULL', critique: true },
    { nom: 'description_conflit', definitionSql: 'TEXT NULL' },
    { nom: 'date_detection', definitionSql: 'TIMESTAMPTZ NOT NULL', critique: true },
    { nom: 'date_resolution', definitionSql: 'TIMESTAMPTZ NULL' },
    { nom: 'statut_resolution', definitionSql: 'VARCHAR(40) NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id_audit_conflict)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'offline', details: ['conflits', 'resolution', 'sync differee', 'chronologie'] },
  ],
};
