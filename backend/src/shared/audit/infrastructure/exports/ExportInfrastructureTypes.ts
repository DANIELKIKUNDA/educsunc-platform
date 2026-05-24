export type AuditExportFormat = 'PDF' | 'CSV' | 'JSON';

export interface AuditExportRequest {
  readonly exportId: string;
  readonly format: AuditExportFormat;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly acteurId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly correlationId?: string;
  readonly volumetrieEstimee?: number;
  readonly forensic: boolean;
  readonly expirationLe?: string;
}

export interface AuditGeneratedExport {
  readonly exportId: string;
  readonly format: AuditExportFormat;
  readonly contenu: string;
  readonly mimeType: string;
  readonly nombreElements: number;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly acteurId?: string;
  readonly forensic: boolean;
  readonly uriStockage?: string;
  readonly expireLe?: string;
  readonly empreinte?: string;
  readonly creeLe: string;
}

export interface AuditExportTrackingRecord {
  readonly exportId: string;
  readonly format: AuditExportFormat;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
  readonly acteurId?: string;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly deviceId?: string;
  readonly correlationId?: string;
  readonly forensic: boolean;
  readonly nombreElements: number;
  readonly creeLe: string;
  readonly expireLe?: string;
  readonly telechargeLe?: string;
  readonly statut: 'GENERE' | 'TELECHARGE' | 'EXPIRE' | 'ECHEC';
}

export interface AuditExportMonitoringSnapshot {
  readonly totalExports: number;
  readonly totalExpires: number;
  readonly totalFailures: number;
  readonly totalForensic: number;
  readonly totalMassifs: number;
  readonly totalDownloads: number;
}
