import { clientApi, type FichierApi } from '../../../shared/http/api.client';
import { construireEntetesPilotageActif } from '../../../shared/session/api-context';
import type {
  AuditEventDto,
  AuditExportDto,
  AuditExportFormat,
  AuditExportStatusDto,
  AuditFilters,
  AuditHttpEnvelope,
  AuditIntegrityItemDto,
  AuditIntegrityRangeDto,
  AuditIntegrityRequest,
  AuditListDto,
  AuditReplayDto,
  AuditReplayRequest,
  AuditRetentionActionDto,
  AuditTimelineDto,
  PlatformAuditApiContext,
} from '../models/platform-audit.model';

type AuditListEnvelope = AuditHttpEnvelope<AuditListDto>;
type AuditEventEnvelope = AuditHttpEnvelope<AuditEventDto>;
type AuditTimelineEnvelope = AuditHttpEnvelope<AuditTimelineDto>;
type AuditExportEnvelope = AuditHttpEnvelope<AuditExportDto>;
type AuditExportStatusEnvelope = AuditHttpEnvelope<AuditExportStatusDto>;
type AuditReplayEnvelope = AuditHttpEnvelope<AuditReplayDto>;
type AuditRetentionEnvelope = AuditHttpEnvelope<AuditRetentionActionDto>;
type AuditIntegrityItemEnvelope = AuditHttpEnvelope<AuditIntegrityItemDto>;
type AuditIntegrityRangeEnvelope = AuditHttpEnvelope<AuditIntegrityRangeDto>;

function queryString(query: Readonly<Record<string, string | number | undefined>>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim()) params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

function platformHeaders(context: PlatformAuditApiContext): Record<string, string> {
  return construireEntetesPilotageActif(context, {
    inclureOrganisationActive: false,
    inclureEcoleActive: false,
  });
}

function filterQuery(filters: AuditFilters): string {
  return queryString({
    taillePage: filters.taillePage,
    cursor: filters.cursor,
    action: filters.action,
    typeAuditPrincipal: filters.typeAuditPrincipal,
    categorieAudit: filters.categorieAudit,
    gravite: filters.gravite,
    resultat: filters.resultat,
    acteurId: filters.acteurId,
    typeRessource: filters.typeRessource,
    ressourceId: filters.ressourceId,
    correlationId: filters.correlationId,
    requestId: filters.requestId,
    sourceAudit: filters.sourceAudit,
    dateDebut: filters.dateDebut,
    dateFin: filters.dateFin,
    organisationId: filters.organisationId,
    ecoleId: filters.ecoleId,
  });
}

export const platformAuditApi = {
  list(filters: AuditFilters, context: PlatformAuditApiContext, signal?: AbortSignal) {
    return clientApi.envoyer<AuditListEnvelope>({
      chemin: `/api/v1/audit${filterQuery(filters)}`,
      entetes: platformHeaders(context),
      signal,
    });
  },

  detail(id: string, context: PlatformAuditApiContext, signal?: AbortSignal) {
    return clientApi.envoyer<AuditEventEnvelope>({
      chemin: `/api/v1/audit/${encodeURIComponent(id)}`,
      entetes: platformHeaders(context),
      signal,
    });
  },

  timeline(filters: AuditFilters, context: PlatformAuditApiContext, signal?: AbortSignal) {
    return clientApi.envoyer<AuditTimelineEnvelope>({
      chemin: `/api/v1/audit/timeline${filterQuery(filters)}`,
      entetes: platformHeaders(context),
      signal,
    });
  },

  history(filters: AuditFilters, context: PlatformAuditApiContext, signal?: AbortSignal) {
    return clientApi.envoyer<AuditListEnvelope>({
      chemin: `/api/v1/audit/history${filterQuery(filters)}`,
      entetes: platformHeaders(context),
      signal,
    });
  },

  createExport(
    format: AuditExportFormat,
    filters: AuditFilters,
    context: PlatformAuditApiContext,
    idempotencyKey: string,
  ) {
    const { cursor: _cursor, taillePage: _taillePage, ...filtres } = filters;
    return clientApi.envoyer<AuditExportEnvelope>({
      methode: 'POST',
      chemin: '/api/v1/exports/audit',
      entetes: { ...platformHeaders(context), 'Idempotency-Key': idempotencyKey },
      corps: { format, filtres },
    });
  },

  createForensicExport(
    format: AuditExportFormat,
    filters: AuditFilters,
    context: PlatformAuditApiContext,
    idempotencyKey: string,
  ) {
    const { cursor: _cursor, taillePage: _taillePage, ...filtres } = filters;
    return clientApi.envoyer<AuditExportEnvelope>({
      methode: 'POST',
      chemin: '/api/v1/exports/forensic',
      entetes: { ...platformHeaders(context), 'Idempotency-Key': idempotencyKey },
      corps: { format, filtres },
    });
  },

  exportStatus(id: string, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditExportStatusEnvelope>({
      chemin: `/api/v1/exports/${encodeURIComponent(id)}/status`,
      entetes: platformHeaders(context),
    });
  },

  downloadExport(id: string, context: PlatformAuditApiContext): Promise<FichierApi> {
    return clientApi.telecharger({
      chemin: `/api/v1/exports/${encodeURIComponent(id)}/download`,
      entetes: platformHeaders(context),
    });
  },

  deleteExport(id: string, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditHttpEnvelope<{ readonly exportId: string; readonly supprime: true }>>({
      methode: 'DELETE',
      chemin: `/api/v1/exports/${encodeURIComponent(id)}`,
      entetes: platformHeaders(context),
    });
  },

  replay(request: AuditReplayRequest, context: PlatformAuditApiContext) {
    const path = request.cible === 'PROJECTIONS' ? 'projections' : 'analytics';
    return clientApi.envoyer<AuditReplayEnvelope>({
      methode: 'POST',
      chemin: `/api/v1/replay/${path}`,
      entetes: platformHeaders(context),
      corps: {
        mode: request.mode,
        raison: request.raison,
        limite: request.limite,
        correlationId: request.correlationId,
      },
    });
  },

  retentionStatus(filters: AuditFilters, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditListEnvelope>({
      chemin: `/api/v1/retention/status${filterQuery(filters)}`,
      entetes: platformHeaders(context),
    });
  },

  archive(dateFin: string, raison: string, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditRetentionEnvelope>({
      methode: 'POST',
      chemin: '/api/v1/retention/archive',
      entetes: platformHeaders(context),
      corps: { dateFin, raison },
    });
  },

  retentionPreview(dateFin: string, raison: string, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditRetentionEnvelope>({
      methode: 'POST',
      chemin: '/api/v1/retention/purge',
      entetes: platformHeaders(context),
      corps: { dateFin, raison },
    });
  },

  verifyEventIntegrity(id: string, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditIntegrityItemEnvelope>({
      chemin: `/api/v1/security/integrity/${encodeURIComponent(id)}`,
      entetes: platformHeaders(context),
    });
  },

  verifyIntegrityRange(request: AuditIntegrityRequest, context: PlatformAuditApiContext) {
    return clientApi.envoyer<AuditIntegrityRangeEnvelope>({
      methode: 'POST',
      chemin: '/api/v1/security/integrity/verify',
      entetes: platformHeaders(context),
      corps: request,
    });
  },
};
