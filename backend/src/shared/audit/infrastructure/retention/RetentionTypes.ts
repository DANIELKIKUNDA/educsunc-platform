export type AuditRetentionLifecycleState =
  | 'ACTIVE'
  | 'HISTORIQUE'
  | 'ARCHIVE'
  | 'COLD_STORAGE'
  | 'PURGE';

export interface AuditRetentionPolicy {
  readonly code: string;
  readonly categorie: string;
  readonly dureeActiveJours: number;
  readonly dureeArchiveJours: number;
  readonly dureeColdStorageJours?: number;
  readonly purgeAutorisee: boolean;
}

export interface AuditRetentionCandidate {
  readonly idAuditEntry: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly dateAction: string;
  readonly lifecycleState: AuditRetentionLifecycleState;
}

export interface AuditRetentionSnapshot {
  readonly totalActifs: number;
  readonly totalArchives: number;
  readonly totalColdStorage: number;
  readonly totalExportsExpires: number;
  readonly totalEligiblesPurge: number;
}
