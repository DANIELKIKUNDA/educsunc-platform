import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';

// Les agregats analytics restent temporels pour limiter les scans long terme.
export const auditAnalyticsDailyPartitionDefinition: AuditPostgresPartitionDefinition = {
  nom: 'audit_analytics_daily_monthly_range',
  tableParent: 'audit_analytics_daily',
  zone: 'analytics',
  strategie: 'RANGE_DATE_REFERENCE',
  colonneSource: 'date_reference',
  granularite: 'MONTHLY',
  partitionParTenantEnV1: false,
  utiliseDateActionReelle: true,
  objectif:
    'Conserver les agregats quotidiens analytics dans un partitionnement mensuel compatible pruning, volumetrie et lecture historique.',
  pruningAttendu: [
    'statistiques mensuelles',
    'tendances',
    'volumetrie historique',
    'incidents de securite par periode',
  ],
  indexesLocauxAttendus: [
    'idx_audit_analytics_daily_date_reference',
    'idx_audit_analytics_daily_dimensions',
  ],
  queryRules: [
    {
      obligation: 'Filtrer les analytics par periode explicite.',
      justification: 'Le document relie explicitement analytics et partitionnement temporel.',
    },
  ],
  maintenanceRules: [
    {
      action: 'CREATION_AUTOMATIQUE',
      description: 'Creer les partitions analytics par mois civil de date_reference.',
    },
    {
      action: 'MONITORING',
      description: 'Surveiller la croissance et la cardinalite des agregats par partition.',
    },
  ],
  notes: [
    'Le document impose la table et la logique temporelle, meme si le detail fin des colonnes analytics a ete peu explicite.',
  ],
};

