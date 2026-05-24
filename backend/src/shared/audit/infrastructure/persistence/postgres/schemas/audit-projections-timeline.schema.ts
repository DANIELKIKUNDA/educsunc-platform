import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema prepare la projection dediee aux timelines rapides.
export const auditProjectionsTimelineSchema: AuditPostgresTableSchema = {
  table: 'audit_projections_timeline',
  mission: 'Accélérer les lectures timeline sans relire la table brute.',
  zone: 'projection',
  appendOnly: true,
  colonnes: [
    { nom: 'id', definitionSql: 'BIGSERIAL PRIMARY KEY', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'acteur_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'id_ressource', definitionSql: 'UUID NULL', critique: true },
    { nom: 'action', definitionSql: 'VARCHAR(150) NOT NULL', critique: true },
    { nom: 'gravite', definitionSql: 'VARCHAR(30) NOT NULL', critique: true },
    { nom: 'resultat', definitionSql: 'VARCHAR(30) NOT NULL', critique: true },
    { nom: 'correlation_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'organisation_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'ecole_id', definitionSql: 'UUID NULL', critique: true },
    { nom: 'scope', definitionSql: 'VARCHAR(80) NOT NULL', critique: true },
    { nom: 'date_action', definitionSql: 'TIMESTAMPTZ NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)' },
  ],
  preparations: [
    { type: 'indexation', details: ['acteur_id', 'id_ressource', 'action', 'gravite', 'resultat', 'correlation_id', 'organisation_id', 'ecole_id', 'scope', 'date_action'] },
  ],
};
