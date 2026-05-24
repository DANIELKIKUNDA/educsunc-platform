import type { AuditEntry } from '../aggregates';

// Ces types partages donnent un vocabulaire stable aux repositories Audit.
export interface AuditPagination {
  page: number;
  taillePage: number;
}

export interface AuditSearchFilters {
  organisationId?: string;
  ecoleId?: string;
  scope?: string;
  acteurId?: string;
  typeActeur?: string;
  typeAuditPrincipal?: string;
  categorieAudit?: string;
  actionAudit?: string;
  graviteAudit?: string;
  niveauAudit?: string;
  resultatAudit?: string;
  typeRessource?: string;
  idRessource?: string;
  correlationId?: string;
  requestId?: string;
  sessionId?: string;
  deviceId?: string;
  adresseIp?: string;
  sourceAudit?: string;
  sourceRuntime?: string;
  modeOffline?: boolean;
  synchronise?: boolean;
  replay?: boolean;
  retry?: boolean;
  enConflit?: boolean;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface AuditSearchResult<TElement> {
  resultats: TElement[];
  total: number;
  page: number;
  taillePage: number;
}

export interface AuditArchiveRecord {
  idArchive: string;
  idAuditEntry: string;
  dateArchivage: Date;
  raisonArchivage?: string;
  typeArchive: string;
  organisationId?: string;
  ecoleId?: string;
}

export interface AuditExportRecord {
  idAuditExport: string;
  idAuditEntry: string;
  acteurId?: string;
  formatExport: string;
  nombreElements: number;
  dateGeneration: Date;
  dateExpiration?: Date;
  organisationId?: string;
  ecoleId?: string;
}

export interface AuditForensicTrace {
  auditEntry: AuditEntry;
  correlationId?: string;
  requestId?: string;
  acteurId?: string;
  deviceId?: string;
  adresseIp?: string;
  typeRelation?: string;
}

export interface AuditAnalyticsSnapshot {
  cle: string;
  dateReference: string;
  compteurs: Record<string, number>;
  dimensions: Record<string, string | undefined>;
}

export interface AuditProjectionRecord {
  idProjection: string;
  idAuditEntry: string;
  typeProjection: string;
  scope?: string;
  actionAudit?: string;
  graviteAudit?: string;
  resultatAudit?: string;
  dateAction: Date;
  organisationId?: string;
  ecoleId?: string;
  correlationId?: string;
  acteurId?: string;
  idRessource?: string;
  donnees: Record<string, unknown>;
}

export interface AuditIdempotencyRecord {
  cleIdempotence: string;
  idAuditEntry: string;
  dateCreation: Date;
  estReplay: boolean;
  estRetry: boolean;
}

export interface AuditSyncConflictRecord {
  idAuditConflict: string;
  idAuditEntry: string;
  typeConflit: string;
  descriptionConflit?: string;
  dateDetection: Date;
  dateResolution?: Date;
  statutResolution: string;
}
