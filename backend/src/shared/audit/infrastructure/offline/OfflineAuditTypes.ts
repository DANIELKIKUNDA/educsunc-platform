import type { AuditEventEnvelope } from '../event-bus';

export interface OfflineAuditQueueItem {
  readonly id: string;
  readonly envelope: AuditEventEnvelope;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly deviceId?: string;
  readonly sourceRuntime?: string;
  readonly dateActionReelle: string;
  readonly dateInsertionLocale: string;
  readonly replayId?: string;
  readonly replaySource?: string;
  readonly replayReason?: string;
  readonly replayTimestamp?: string;
  readonly retryCount: number;
  readonly retryLimit: number;
  readonly retryBackoffMs: number;
  readonly retryHistory: string[];
  readonly fingerprint: string;
  readonly statut: 'EN_ATTENTE' | 'EN_SYNCHRONISATION' | 'SYNCHRONISE' | 'ECHEC' | 'CONFLIT';
}

export interface OfflineAuditCacheEntry {
  readonly cleCache: string;
  readonly valeur: Record<string, unknown>;
  readonly creeLe: string;
  readonly expireLe?: string;
}

export interface OfflineAuditDeviceState {
  readonly deviceId: string;
  readonly userAgent?: string;
  readonly versionApplication?: string;
  readonly sourceRuntime?: string;
  readonly derniereActionLe: string;
  readonly derniereSynchronisationLe?: string;
  readonly synchronisationsReussies: number;
  readonly synchronisationsEchouees: number;
}

export interface OfflineAuditChronologyEntry {
  readonly id: string;
  readonly auditId?: string;
  readonly eventId?: string;
  readonly syncId?: string;
  readonly replayId?: string;
  readonly retryCount: number;
  readonly dateActionReelle: string;
  readonly dateInsertionLocale: string;
  readonly dateSynchronisation?: string;
  readonly dateInsertionServeur?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly deviceId?: string;
}

export interface OfflineAuditConflictRecord {
  readonly idConflit: string;
  readonly idQueueItem: string;
  readonly typeConflit: string;
  readonly description?: string;
  readonly detecteLe: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly resolu: boolean;
  readonly resolution?: string;
}

export interface OfflineAuditRecoveryCheckpoint {
  readonly idCheckpoint: string;
  readonly dernierCurseurSync?: string;
  readonly itemsEnAttente: string[];
  readonly creeLe: string;
}

export interface OfflineAuditForensicSnapshot {
  readonly syncId?: string;
  readonly replayId?: string;
  readonly deviceId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly queueItemIds: string[];
  readonly chronologyIds: string[];
}

export interface OfflineAuditMonitoringSnapshot {
  readonly totalQueue: number;
  readonly totalEnAttente: number;
  readonly totalSynchronises: number;
  readonly totalEnEchec: number;
  readonly totalConflits: number;
  readonly totalDevices: number;
  readonly totalReplays: number;
  readonly totalRetries: number;
}
