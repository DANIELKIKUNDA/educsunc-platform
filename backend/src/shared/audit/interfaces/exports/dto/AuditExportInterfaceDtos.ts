import type { AuditExportQuery } from 'shared/audit/application';

export interface AuditExportRequestDto extends AuditExportQuery {
  readonly typeExport: 'AUDIT' | 'FORENSIC' | 'ANALYTICS';
}

export interface AuditExportStatusDto {
  readonly exportId: string;
  readonly status: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'EXPIRE' | 'ECHOUE' | 'ANNULE';
  readonly progress?: number;
  readonly expiresAt?: string;
  readonly correlationId?: string;
}

export interface AuditExportDownloadDto {
  readonly exportId: string;
  readonly telechargement: string;
  readonly expiresAt?: string;
}

export interface AuditExportCancellationDto {
  readonly exportId: string;
  readonly annule: boolean;
  readonly raison?: string;
}

export interface AuditExportExpirationDto {
  readonly exportId: string;
  readonly expire: boolean;
  readonly expirationAt?: string;
}

export interface AuditExportTrackingDto {
  readonly exportId: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
  readonly statut: string;
}

export interface AuditExportMonitoringDto {
  readonly actifs: number;
  readonly echoues: number;
  readonly downloads: number;
  readonly expirations: number;
  readonly volumetrie: number;
}

export interface AuditExportRecoveryDto {
  readonly exportId: string;
  readonly restaure: boolean;
}

