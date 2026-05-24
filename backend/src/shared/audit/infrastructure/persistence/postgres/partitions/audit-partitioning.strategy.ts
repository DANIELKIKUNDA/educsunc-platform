import type { AuditPostgresPartitionDefinition } from './audit-postgres-partition.types';
import { auditAnalyticsDailyPartitionDefinition } from './audit-analytics-daily.partitions';
import { auditArchivesPartitionDefinition } from './audit-archives.partitions';
import { auditEntriesPartitionDefinition } from './audit-entries.partitions';
import { auditForensicLinksPartitionDefinition } from './audit-forensic-links.partitions';

export const auditPostgresPartitionDefinitions: readonly AuditPostgresPartitionDefinition[] = [
  auditEntriesPartitionDefinition,
  auditForensicLinksPartitionDefinition,
  auditArchivesPartitionDefinition,
  auditAnalyticsDailyPartitionDefinition,
];

// Resume officiel de la strategie V1 de partitionnement Audit.
export const auditPartitioningStrategyV1 = {
  partitionnementPrincipal: 'temporel',
  granularite: 'mensuelle',
  cleNaturelle: 'date_action',
  partitionnementTenantEnV1: false,
  combinaisonTenant: 'partition temporelle + indexes tenant',
  obligations: [
    'RANGE(date_action) sur audit_entries',
    'bornes temporelles obligatoires dans les APIs de lecture',
    'pagination obligatoire pour les lectures massives',
    'creation automatique des partitions futures',
    'rotation et archivage des anciennes partitions',
    'monitoring taille partitions',
  ] as const,
  justifications: [
    'Le document recommande explicitement le partitionnement temporel comme strategie officielle V1.',
    'La granularite mensuelle est presentee comme le meilleur compromis.',
    'Le partitionnement par tenant est explicitement refuse en V1.',
  ] as const,
} as const;

