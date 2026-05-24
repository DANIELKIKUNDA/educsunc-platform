import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';

// Strategie officielle V1 : audit_entries est partitionnee temporellement par date_action.
export const auditEntriesPartitionDefinition: AuditPostgresPartitionDefinition = {
  nom: 'audit_entries_v1_monthly_range',
  tableParent: 'audit_entries',
  zone: 'transactionnelle',
  strategie: 'RANGE_DATE_ACTION',
  colonneSource: 'date_action',
  granularite: 'MONTHLY',
  partitionParTenantEnV1: false,
  utiliseDateActionReelle: true,
  objectif:
    "Faire de date_action la cle naturelle de scalabilite Audit, avec pruning mensuel, append-only et compatibilite offline-first.",
  pruningAttendu: [
    'timeline',
    'forensic temporel',
    'exports par periode',
    'analytics par periode',
    'volumetrie historique',
  ],
  indexesLocauxAttendus: [
    'idx_audit_entries_date_action',
    'idx_audit_entries_tenant',
    'idx_audit_entries_tenant_date',
    'idx_audit_entries_correlation',
    'idx_audit_entries_request',
    'idx_audit_entries_session',
    'idx_audit_entries_device',
    'idx_audit_entries_analytics',
  ],
  queryRules: [
    {
      obligation: 'Toujours filtrer par borne temporelle sur date_action.',
      justification: 'Le document impose des APIs et queries partition-friendly pour activer le pruning PostgreSQL.',
    },
    {
      obligation: 'Paginer toutes les lectures larges Audit.',
      justification: 'La pagination obligatoire evite les scans complets sur toutes les partitions.',
    },
    {
      obligation: 'Utiliser la date_action reelle et jamais la date insertion serveur.',
      justification: "Les evenements offline synchronises plus tard doivent conserver la vraie chronologie forensic.",
    },
  ],
  maintenanceRules: [
    {
      action: 'CREATION_AUTOMATIQUE',
      description: 'Prevoir la creation automatique des partitions mensuelles futures.',
    },
    {
      action: 'ROTATION',
      description: 'Prevoir une rotation des partitions anciennes sans casser l append-only.',
    },
    {
      action: 'ARCHIVAGE',
      description: 'Les anciennes partitions doivent pouvoir etre archivees en bloc.',
    },
    {
      action: 'SUPPRESSION_CONTROLEE',
      description: 'Toute suppression de partition doit etre gouvernee par retention et archivage.',
    },
    {
      action: 'MONITORING',
      description: 'Surveiller la taille des partitions, leur croissance et les fenetres manquantes.',
    },
  ],
  notes: [
    'Pas de partitionnement par tenant en V1.',
    'La strategie V1 reste temporelle + indexes tenant, combinaison explicitement recommandee par le document.',
    'La granularite mensuelle est retenue pour equilibrer pruning, maintenance et overhead PostgreSQL.',
  ],
};

