import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema supporte l'archivage logique sans suppression.
export const auditArchivesSchema: AuditPostgresTableSchema = {
  table: 'audit_archives',
  mission: "Supporter l'archivage logique sans supprimer la verite historique.",
  zone: 'archive',
  appendOnly: true,
  colonnes: [
    { nom: 'id_archive', definitionSql: 'UUID PRIMARY KEY', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'date_archivage', definitionSql: 'TIMESTAMPTZ NOT NULL', critique: true },
    { nom: 'raison_archivage', definitionSql: 'VARCHAR(255) NULL' },
    { nom: 'type_archive', definitionSql: 'VARCHAR(80) NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id_archive)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'archivage', details: ['conservation longue', 'cold storage futur', 'lecture archive', 'migration archive'] },
    { type: 'partitionnement', details: ['archivage par partitions temporelles envisage explicitement par le document'] },
  ],
};
