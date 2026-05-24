import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditPagination, AuditSearchResult, AuditTimelineRepository } from '../../../../domain/repositories';
import { appliquerFiltresAudit, paginer, trierChronologiquementDesc } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository reconstruit les timelines en gardant une chronologie stricte.
export class PostgresAuditTimelineRepository implements AuditTimelineRepository {
  public async listerTimelineRessource(idRessource: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre({ idRessource }, pagination);
  }

  public async listerTimelineUtilisateur(idUtilisateur: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre({ acteurId: idUtilisateur }, pagination);
  }

  public async listerTimelineTenant(
    params: { organisationId?: string; ecoleId?: string; scope?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre(params, pagination);
  }

  public async listerTimelineWorkflow(correlationId: string, pagination?: AuditPagination): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre({ correlationId }, pagination);
  }

  public async listerTimelineSecurite(
    filtres: { organisationId?: string; ecoleId?: string; graviteAudit?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre({ ...filtres, categorieAudit: 'SECURITE' }, pagination);
  }

  public async listerTimelineSynchronisation(
    filtres: { organisationId?: string; ecoleId?: string; statutResolution?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    void filtres.statutResolution;
    return this.paginerParFiltre({ organisationId: filtres.organisationId, ecoleId: filtres.ecoleId, categorieAudit: 'SYNC' }, pagination);
  }

  public async listerTimelineExports(
    filtres: { organisationId?: string; ecoleId?: string; acteurId?: string },
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    return this.paginerParFiltre({ ...filtres, categorieAudit: 'EXPORT' }, pagination);
  }

  private async paginerParFiltre(
    filtres: Record<string, unknown>,
    pagination?: AuditPagination,
  ): Promise<AuditSearchResult<AuditEntry>> {
    const resultats = trierChronologiquementDesc(
      [...obtenirMemoireAuditStore().auditEntries.values()].filter((entree) =>
        appliquerFiltresAudit(entree, filtres as Parameters<typeof appliquerFiltresAudit>[1])),
    );
    return paginer(resultats, pagination);
  }
}
