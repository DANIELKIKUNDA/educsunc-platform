import type {
  AuditAnalyticsRepository,
  AuditArchiveRepository,
  AuditEntryRepository,
  AuditExportRepository,
  AuditForensicRepository,
  AuditOfflineRepository,
  AuditPagination,
  AuditRetentionRepository,
  AuditSearchFilters,
  AuditSearchResult,
  AuditSearchRepository,
  AuditSyncConflictRepository,
  AuditTimelineRepository,
} from '../../../../domain/repositories';
import type { AuditEntry } from '../../../../domain/aggregates';
import type { SearchAuditQuery } from '../../../../application/dto/queries/SearchAuditQuery';
import type { AuditTimelineQuery } from '../../../../application/dto/queries/AuditTimelineQuery';
import type { AuditAnalyticsQuery } from '../../../../application/dto/queries/AuditAnalyticsQuery';
import { AuditEntryPersistenceMapper } from '../mappers/AuditEntryPersistenceMapper';
import { AuditTimelineMapper } from '../mappers/AuditTimelineMapper';
import type { AuditSearchReadModel } from '../../../../application/read-models/search/AuditSearchReadModel';
import type { AuditSearchItemReadModel } from '../../../../application/read-models/search/AuditSearchItemReadModel';
import type { AuditTimelineReadModel } from '../../../../application/read-models/timeline/AuditTimelineReadModel';
import type { TimelineEventReadModel } from '../../../../application/read-models/timeline/TimelineEventReadModel';

// Ces aides centralisent les conversions applicatives communes des queries Audit.
export function versPagination(query: SearchAuditQuery): AuditPagination {
  return {
    page: query.page ?? 1,
    taillePage: query.taillePage ?? 25,
  };
}

export function versFiltresRecherche(query: SearchAuditQuery): AuditSearchFilters {
  return {
    actionAudit: query.action,
    typeAuditPrincipal: query.typeAuditPrincipal,
    categorieAudit: query.categorieAudit,
    graviteAudit: query.gravite,
    resultatAudit: query.resultat,
    acteurId: query.acteurId,
    idRessource: query.ressourceId,
    correlationId: query.correlationId,
    organisationId: query.organisationId,
    ecoleId: query.ecoleId,
  };
}

export function versFiltresTimeline(query: AuditTimelineQuery): AuditSearchFilters {
  return {
    categorieAudit: query.categorieAudit,
    acteurId: query.acteurId,
    idRessource: query.ressourceId,
    correlationId: query.correlationId ?? query.workflowId,
  };
}

export function versFiltresAnalytics(query: AuditAnalyticsQuery): AuditSearchFilters {
  return {
    organisationId: query.organisationId,
    ecoleId: query.ecoleId,
    typeAuditPrincipal: query.typeAuditPrincipal,
  };
}

export function versSearchReadModel(resultat: AuditSearchResult<AuditEntry>, filtres?: Record<string, unknown>): AuditSearchReadModel {
  const items: AuditSearchItemReadModel[] = resultat.resultats.map((entree) => AuditEntryPersistenceMapper.versSearchReadModel(entree));
  return {
    total: resultat.total,
    items,
    pagination: {
      page: resultat.page,
      taillePage: resultat.taillePage,
      total: resultat.total,
    },
    filtres,
  };
}

export function versTimelineReadModel(entrees: readonly AuditEntry[], correlationId?: string): AuditTimelineReadModel {
  const items: TimelineEventReadModel[] = AuditTimelineMapper.versReadModels(
    entrees.map((entree) => AuditEntryPersistenceMapper.versAuditEntryOutput(entree)),
  );
  return {
    correlationId,
    items,
  };
}

export function premier<TElement>(elements: readonly TElement[]): TElement | undefined {
  return elements.length > 0 ? elements[0] : undefined;
}

export interface AuditQueryDependencies {
  readonly entryRepository: AuditEntryRepository;
  readonly searchRepository: AuditSearchRepository;
  readonly timelineRepository: AuditTimelineRepository;
  readonly exportRepository: AuditExportRepository;
  readonly archiveRepository: AuditArchiveRepository;
  readonly forensicRepository: AuditForensicRepository;
  readonly analyticsRepository: AuditAnalyticsRepository;
  readonly offlineRepository: AuditOfflineRepository;
  readonly retentionRepository: AuditRetentionRepository;
  readonly syncConflictRepository: AuditSyncConflictRepository;
}
