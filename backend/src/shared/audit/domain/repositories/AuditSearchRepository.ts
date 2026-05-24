import { AuditEntry } from '../aggregates';
import type { AuditPagination, AuditSearchFilters, AuditSearchResult } from './AuditRepositoryTypes';

// Ce repository fournit la recherche multi-criteres dans l'historique.
export interface AuditSearchRepository {
  rechercher(filtres: AuditSearchFilters, pagination: AuditPagination): Promise<AuditSearchResult<AuditEntry>>;
  rechercherCritiques?(filtres: AuditSearchFilters, pagination: AuditPagination): Promise<AuditSearchResult<AuditEntry>>;
  rechercherConsultationsSensibles?(
    filtres: AuditSearchFilters,
    pagination: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>>;
}
