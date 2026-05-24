import type { AuditForensicQuery, AuditForensicOutput } from 'shared/audit/application';

export interface AuditForensicInvestigationRequestDto extends AuditForensicQuery {
  readonly typeInvestigation:
    | 'TIMELINE'
    | 'CORRELATION'
    | 'CHRONOLOGY'
    | 'SESSION'
    | 'DEVICE'
    | 'REPLAY'
    | 'RETRY'
    | 'SYNCHRONIZATION'
    | 'INCIDENT'
    | 'SUSPICION';
}

export interface AuditForensicTimelineDto {
  readonly investigationId: string;
  readonly chronology: readonly unknown[];
  readonly resume: string;
}

export interface AuditForensicCorrelationDto {
  readonly investigationId: string;
  readonly correlations: readonly {
    readonly correlationId?: string;
    readonly actions: readonly string[];
  }[];
}

export interface AuditForensicSessionDto {
  readonly investigationId: string;
  readonly sessionId?: string;
  readonly resume: string;
}

export interface AuditForensicDeviceDto {
  readonly investigationId: string;
  readonly deviceId?: string;
  readonly resume: string;
}

export interface AuditForensicIncidentDto {
  readonly investigationId: string;
  readonly incidentId?: string;
  readonly resume: string;
  readonly indicateurs?: Record<string, number>;
}

export interface AuditForensicMonitoringDto {
  readonly anomalies: number;
  readonly incidents: number;
  readonly retries: number;
  readonly replays: number;
  readonly syncFailures: number;
}

export interface AuditForensicRecoveryDto {
  readonly investigationId: string;
  readonly restaure: boolean;
}

export interface AuditForensicMaskedDto extends AuditForensicOutput {
  readonly masque: true;
}

