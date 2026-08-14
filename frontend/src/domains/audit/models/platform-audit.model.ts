export type AuditSeverity = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export type AuditResult =
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUSED'
  | 'RETRIED'
  | 'REPLAYED'
  | 'IGNORED_DUPLICATE'
  | 'CONFLICT'
  | 'CANCELLED';

export type AuditExportFormat = 'CSV' | 'JSON' | 'PDF';
export type AuditReplayTarget = 'PROJECTIONS' | 'ANALYTICS';
export type AuditReplayMode = 'DRY_RUN' | 'EXECUTE';
export type AuditRequestStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PlatformAuditApiContext {
  readonly utilisateurId: string | null;
  readonly organisationId: null;
  readonly ecoleId: null;
}

export interface AuditActorDto {
  readonly idUtilisateur?: string;
  readonly typeActeur?: string;
  readonly roleActif?: string;
}

export interface AuditResourceDto {
  readonly typeRessource?: string;
  readonly idRessource?: string;
  readonly libelle?: string;
}

export interface AuditTenantDto {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: string;
}

export interface AuditContextDto {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly sessionId?: string;
  readonly sourceAudit: string;
  readonly modeOffline: boolean;
}

export interface AuditEventDto {
  readonly idAuditEntry: string;
  readonly action: string;
  readonly typePrincipal: string;
  readonly typeAuditPrincipal: string;
  readonly categories: readonly string[];
  readonly gravite: AuditSeverity | string;
  readonly resultat: AuditResult | string;
  readonly acteur: AuditActorDto;
  readonly ressource?: AuditResourceDto;
  readonly tenant: AuditTenantDto;
  readonly contexte: AuditContextDto;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly dateAction: string;
}

export interface AuditPaginationDto {
  readonly page: number;
  readonly taille: number;
  readonly total: number;
  readonly totalPages: number;
  readonly nextCursor?: string;
  readonly hasNextPage: boolean;
}

export interface AuditListDto {
  readonly total: number;
  readonly items: readonly AuditEventDto[];
  readonly pagination: AuditPaginationDto;
}

export interface AuditTimelineDto {
  readonly correlationId?: string;
  readonly acteur?: string;
  readonly ressource?: string;
  readonly timeline: readonly AuditEventDto[];
}

export interface AuditApiMeta {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly durationMs?: number;
}

export interface AuditSuccessBody<T> {
  readonly success: true;
  readonly data: T;
}

export interface AuditHttpEnvelope<T> {
  readonly donnee: AuditSuccessBody<T> | T;
  readonly meta?: AuditApiMeta;
}

export interface AuditFilters {
  readonly taillePage: number;
  readonly cursor?: string;
  readonly action?: string;
  readonly typeAuditPrincipal?: string;
  readonly categorieAudit?: string;
  readonly gravite?: AuditSeverity | string;
  readonly resultat?: AuditResult | string;
  readonly acteurId?: string;
  readonly typeRessource?: string;
  readonly ressourceId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sourceAudit?: string;
  readonly dateDebut?: string;
  readonly dateFin?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export interface AuditFilterDraft {
  action: string;
  typeAuditPrincipal: string;
  categorieAudit: string;
  gravite: string;
  resultat: string;
  acteurId: string;
  typeRessource: string;
  ressourceId: string;
  correlationId: string;
  requestId: string;
  sourceAudit: string;
  dateDebut: string;
  dateFin: string;
  organisationId: string;
  ecoleId: string;
}

export interface AuditMetadataField {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface AuditEventViewModel {
  readonly id: string;
  readonly dateIso: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly action: string;
  readonly actionLabel: string;
  readonly type: string;
  readonly typeLabel: string;
  readonly categories: readonly string[];
  readonly categoryLabels: readonly string[];
  readonly severity: string;
  readonly severityLabel: string;
  readonly result: string;
  readonly resultLabel: string;
  readonly actorId: string;
  readonly actorLabel: string;
  readonly actorRole: string;
  readonly resourceId: string;
  readonly resourceType: string;
  readonly resourceLabel: string;
  readonly scope: string;
  readonly scopeLabel: string;
  readonly organizationId: string;
  readonly schoolId: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly sessionId: string;
  readonly source: string;
  readonly sourceLabel: string;
  readonly offline: boolean;
  readonly metadata: readonly AuditMetadataField[];
}

export interface AuditExportDto {
  readonly exportId: string;
  readonly format: AuditExportFormat | string;
  readonly nombreElements: number;
  readonly dateGeneration: string;
  readonly statut?: string;
  readonly urlTemporaire?: string;
}

export interface AuditExportStatusDto {
  readonly exportId: string;
  readonly statut: string;
  readonly nombreElements?: number;
  readonly erreur?: string;
  readonly expireLe?: string;
}

export interface AuditExportJobViewModel {
  readonly id: string;
  readonly format: string;
  readonly status: string;
  readonly statusLabel: string;
  readonly itemCount?: number;
  readonly requestedAt: string;
  readonly expiresAt?: string;
  readonly error?: string;
}

export interface AuditReplayRequest {
  readonly cible: AuditReplayTarget;
  readonly mode: AuditReplayMode;
  readonly raison: string;
  readonly limite: number;
  readonly correlationId?: string;
}

export interface AuditReplayDto {
  readonly replayId: string;
  readonly cible: AuditReplayTarget;
  readonly mode: AuditReplayMode;
  readonly statut: string;
  readonly evenementsCompatibles?: number;
  readonly reconstruites?: number;
  readonly mutationsMetier?: number;
  readonly limite?: number;
  readonly tronque?: boolean;
  readonly idempotent?: boolean;
  readonly erreur?: string;
}

export interface AuditRetentionActionDto {
  readonly periode: string;
  readonly valeurs: Readonly<Record<string, number>>;
  readonly compteurs: Readonly<Record<string, number>>;
}

export interface AuditIntegrityItemDto {
  readonly idAuditEntry?: string;
  readonly statut: 'VALID' | 'CORRUPTED' | 'MISSING' | 'UNKNOWN' | string;
  readonly raison?: string;
}

export interface AuditIntegrityRangeDto {
  readonly compteurs: Readonly<Record<'VALID' | 'CORRUPTED' | 'MISSING' | 'UNKNOWN', number>>;
  readonly totalVerifie: number;
  readonly tronque: boolean;
  readonly anomalies: readonly AuditIntegrityItemDto[];
}

export interface AuditIntegrityRequest {
  readonly dateDebut?: string;
  readonly dateFin?: string;
  readonly limite: number;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

export const createEmptyAuditFilterDraft = (): AuditFilterDraft => ({
  action: '',
  typeAuditPrincipal: '',
  categorieAudit: '',
  gravite: '',
  resultat: '',
  acteurId: '',
  typeRessource: '',
  ressourceId: '',
  correlationId: '',
  requestId: '',
  sourceAudit: '',
  dateDebut: '',
  dateFin: '',
  organisationId: '',
  ecoleId: '',
});
