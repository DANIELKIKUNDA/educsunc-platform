// Ces types structurent la strategie officielle de partitionnement PostgreSQL Audit.

export type AuditPartitionZone =
  | 'transactionnelle'
  | 'projection'
  | 'analytics'
  | 'forensic'
  | 'archive';

export type AuditPartitionStrategy =
  | 'RANGE_DATE_ACTION'
  | 'RANGE_DATE_ARCHIVAGE'
  | 'RANGE_DATE_REFERENCE'
  | 'INDIRECT_RANGE_VIA_SOURCE_AUDIT';

export type AuditPartitionGranularity = 'MONTHLY';

export interface AuditPostgresPartitionQueryRule {
  readonly obligation: string;
  readonly justification: string;
}

export interface AuditPostgresPartitionMaintenanceRule {
  readonly action: 'CREATION_AUTOMATIQUE' | 'ROTATION' | 'ARCHIVAGE' | 'SUPPRESSION_CONTROLEE' | 'MONITORING';
  readonly description: string;
}

export interface AuditPostgresPartitionDefinition {
  readonly nom: string;
  readonly tableParent: string;
  readonly zone: AuditPartitionZone;
  readonly strategie: AuditPartitionStrategy;
  readonly colonneSource: string;
  readonly granularite: AuditPartitionGranularity;
  readonly partitionParTenantEnV1: boolean;
  readonly utiliseDateActionReelle: boolean;
  readonly partitionIndirecteVia?: string;
  readonly objectif: string;
  readonly pruningAttendu: readonly string[];
  readonly indexesLocauxAttendus: readonly string[];
  readonly queryRules: readonly AuditPostgresPartitionQueryRule[];
  readonly maintenanceRules: readonly AuditPostgresPartitionMaintenanceRule[];
  readonly notes?: readonly string[];
}

