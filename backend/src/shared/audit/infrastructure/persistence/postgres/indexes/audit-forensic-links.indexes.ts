import type { AuditPostgresIndexDefinition } from './audit-postgres-index.types';

export const auditForensicLinksIndexes: readonly AuditPostgresIndexDefinition[] = [
  {
    nom: 'idx_audit_forensic_source',
    table: 'audit_forensic_links',
    famille: 'forensic',
    methode: 'BTREE',
    colonnes: ['audit_entry_source'],
    critique: true,
    justification: "Chaînes d'événements depuis la source forensic.",
  },
  {
    nom: 'idx_audit_forensic_target',
    table: 'audit_forensic_links',
    famille: 'forensic',
    methode: 'BTREE',
    colonnes: ['audit_entry_cible'],
    critique: true,
    justification: "Chaînes d'événements vers la cible forensic.",
  },
];
