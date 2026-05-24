import type { AuditPostgresTableSchema } from './audit-postgres-schema.types';

// Ce schema decrit le support des categories multiples d'un audit.
export const auditCategoriesSchema: AuditPostgresTableSchema = {
  table: 'audit_categories',
  mission: "Supporter l'appartenance d'un audit a plusieurs categories.",
  zone: 'transactionnelle',
  appendOnly: true,
  colonnes: [
    { nom: 'id', definitionSql: 'BIGSERIAL PRIMARY KEY', critique: true },
    { nom: 'audit_entry_id', definitionSql: 'UUID NOT NULL', critique: true },
    { nom: 'categorie', definitionSql: 'VARCHAR(80) NOT NULL', critique: true },
  ],
  contraintes: [
    { type: 'primary_key', expression: 'PRIMARY KEY (id)' },
    { type: 'foreign_key', expression: 'FOREIGN KEY (audit_entry_id) REFERENCES audit_entries(id_audit_entry)', justification: 'Lien de coherence vers la verite append-only principale.' },
  ],
  notes: ['Le document donne FINANCIER + SECURITE comme exemple de multi-categorie sur une meme entree.'],
};
