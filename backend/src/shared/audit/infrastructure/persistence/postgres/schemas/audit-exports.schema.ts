import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema historise les exports audit eux-memes.
export const auditExportsSchema: AuditPostgresTableSchema = {
  table: 'audit_exports',
  mission: 'Historiser chaque export audit sensible.',
  zone: 'transactionnelle',
  appendOnly: true,
  colonnes: [
    { nom: 'id_audit_export', definitionSql: 'UUID PRIMARY KEY', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'acteur_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'format_export', definitionSql: 'VARCHAR(30) NOT NULL', critique: true },
    { nom: 'nombre_elements', definitionSql: 'INTEGER NOT NULL', critique: true },
    { nom: 'date_generation', definitionSql: 'TIMESTAMPTZ NOT NULL', critique: true },
    { nom: 'date_expiration', definitionSql: 'TIMESTAMPTZ NULL' },
    { nom: 'organisation_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'ecole_id', definitionSql: 'UUID NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id_audit_export)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'indexation', details: ['acteur_id', 'format_export', 'date_generation', 'organisation_id', 'ecole_id'] },
    { type: 'forensic', details: ["Chaque export doit rester tracable comme evenement sensible d'investigation."] },
  ],
};
