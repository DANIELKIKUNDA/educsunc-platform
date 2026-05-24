import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditPagination, AuditSearchFilters, AuditSearchRepository, AuditSearchResult } from '../../../../domain/repositories';
import { appliquerFiltresAudit, paginer, trierChronologiquementDesc } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository execute les recherches paginees et legeres recommandees par le document.
export class PostgresAuditSearchRepository implements AuditSearchRepository {
  public async rechercher(filtres: AuditSearchFilters, pagination: AuditPagination): Promise<AuditSearchResult<AuditEntry>> {
    const resultats = trierChronologiquementDesc(
      [...obtenirMemoireAuditStore().auditEntries.values()].filter((entree) => appliquerFiltresAudit(entree, filtres)),
    );
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
