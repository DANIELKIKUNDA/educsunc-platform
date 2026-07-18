import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditPagination, AuditSearchFilters, AuditSearchRepository, AuditSearchResult } from '../../../../domain/repositories';
import { paginer } from './audit-repository.helpers';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';

// Ce repository execute les recherches paginees et legeres recommandees par le document.
export class PostgresAuditSearchRepository implements AuditSearchRepository {
  public constructor(private readonly entries = new PostgresAuditEntryRepository()) {}

  public async rechercher(filtres: AuditSearchFilters, pagination: AuditPagination): Promise<AuditSearchResult<AuditEntry>> {
    const resultats = await this.entries.listerSelonFiltres(filtres);
    return paginer(resultats, pagination);
  }

  public async rechercherCritiques(
    filtres: AuditSearchFilters,
    pagination: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    return this.rechercher({ ...filtres, graviteAudit: filtres.graviteAudit ?? 'CRITIQUE' }, pagination);
  }

  public async rechercherConsultationsSensibles(
    filtres: AuditSearchFilters,
    pagination: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    return this.rechercher({ ...filtres, categorieAudit: 'CONSULTATION' }, pagination);
  }
}
