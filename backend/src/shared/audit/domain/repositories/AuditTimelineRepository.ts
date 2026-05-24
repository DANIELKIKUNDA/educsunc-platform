import { AuditEntry } from '../aggregates';
import type { AuditPagination, AuditSearchResult } from './AuditRepositoryTypes';

// Ce repository reconstruit les timelines par ressource, utilisateur ou workflow.
export interface AuditTimelineRepository {
  listerTimelineRessource(idRessource: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineUtilisateur(idUtilisateur: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineTenant(
    params: { organisationId?: string; ecoleId?: string; scope?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineWorkflow(correlationId: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineSecurite(
    filtres: { organisationId?: string; ecoleId?: string; graviteAudit?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineSynchronisation(
    filtres: { organisationId?: string; ecoleId?: string; statutResolution?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>>;
  listerTimelineExports?(
    filtres: { organisationId?: string; ecoleId?: string; acteurId?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>>;
}
