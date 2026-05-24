import type { AuditPostgresIndexDefinition } from './audit-postgres-index.types';

export const auditExportsIndexes: readonly AuditPostgresIndexDefinition[] = [
  {
    nom: 'idx_audit_exports_tenant',
    table: 'audit_exports',
    famille: 'exports',
    methode: 'BTREE',
    colonnes: ['organisation_id', 'ecole_id', 'date_generation'],
    tri: ['ASC', 'ASC', 'DESC'],
    critique: true,
    justification: "Historique des exports sensibles par tenant avec tri de génération.",
  },
  {
    nom: 'idx_audit_exports_acteur',
    table: 'audit_exports',
    famille: 'exports',
    methode: 'BTREE',
    colonnes: ['acteur_id'],
    critique: true,
    justification: 'Surveillance des exports par acteur.',
  },
];
