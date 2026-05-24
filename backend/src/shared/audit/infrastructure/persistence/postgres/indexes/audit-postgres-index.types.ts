export type AuditIndexFamily =
  | 'transactionnel'
  | 'timeline'
  | 'forensic'
  | 'multi_tenant'
  | 'offline_sync'
  | 'analytics'
  | 'exports'
  | 'jsonb'
  | 'archives'
  | 'partitionnement';

export type AuditIndexMethod = 'BTREE' | 'GIN' | 'BRIN';

export interface AuditPostgresIndexDefinition {
  readonly nom: string;
  readonly table: string;
  readonly famille: AuditIndexFamily;
  readonly methode: AuditIndexMethod;
  readonly colonnes: readonly string[];
  readonly expressionSql?: string;
  readonly tri?: readonly ('ASC' | 'DESC')[];
  readonly unique?: boolean;
  readonly critique: boolean;
  readonly justification: string;
  readonly partitionFriendly?: boolean;
  readonly notes?: readonly string[];
}
