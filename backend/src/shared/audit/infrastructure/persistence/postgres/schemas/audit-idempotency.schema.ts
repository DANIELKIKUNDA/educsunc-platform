import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema supporte l'idempotence offline-first des ecritures Audit.
export const auditIdempotencySchema: AuditPostgresTableSchema = {
  table: 'audit_idempotency',
  mission: 'Empêcher les doublons, replays incoherents et retries multiples.',
  zone: 'idempotency',
  appendOnly: true,
  colonnes: [
    { nom: 'id', definitionSql: 'BIGSERIAL PRIMARY KEY', critique: true },
    { nom: 'cle_idempotence', definitionSql: 'VARCHAR(255) NOT NULL UNIQUE', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'date_creation', definitionSql: 'TIMESTAMPTZ NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id)' },
    { type: 'unique', expression: 'UNIQUE (cle_idempotence)', justification: "Contrainte explicitement citee par le document." },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'offline', details: ['offline', 'sync', 'queues', 'workers', 'retry', 'replay'] },
  ],
};
