import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema supporte les correlations forensic entre entrees d'audit.
export const auditForensicLinksSchema: AuditPostgresTableSchema = {
  table: 'audit_forensic_links',
  mission: 'Supporter les corrélations forensic et chaines d evenements.',
  zone: 'forensic',
  appendOnly: true,
  colonnes: [
    { nom: 'id', definitionSql: 'BIGSERIAL PRIMARY KEY', critique: true },
    { nom: 'audit_entry_source', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'audit_entry_cible', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'type_relation', definitionSql: 'VARCHAR(80) NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_source) REFERENCES audit_entries(id_audit_entry)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_cible) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'forensic', details: ['chaines evenements', 'workflows', 'investigations', 'correlations complexes'] },
    { type: 'indexation', details: ['audit_entry_source', 'audit_entry_cible', 'type_relation'] },
  ],
};
