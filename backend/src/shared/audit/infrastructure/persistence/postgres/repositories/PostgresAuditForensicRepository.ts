import type { AuditForensicRepository, AuditForensicTrace } from '../../../../domain/repositories';
import { appliquerFiltresAudit, construireTraceForensic, trierChronologiquementDesc } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository concentre les lectures d'investigation et de correlation avancee.
export class PostgresAuditForensicRepository implements AuditForensicRepository {
  public async listerEvenementsCritiques(filtres: Record<string, unknown>): Promise<AuditForensicTrace[]> {
    return this.tracer({ ...filtres, graviteAudit: String(filtres.graviteAudit ?? 'CRITIQUE') });
  }

  public async suivreUtilisateur(idUtilisateur: string): Promise<AuditForensicTrace[]> {
    return this.tracer({ acteurId: idUtilisateur });
  }

  public async suivreAppareil(deviceId: string): Promise<AuditForensicTrace[]> {
    return this.tracer({ deviceId });
  }

  public async suivreAdresseIp(adresseIp: string): Promise<AuditForensicTrace[]> {
    return this.tracer({ adresseIp });
  }

  public async suivreWorkflow(correlationId: string): Promise<AuditForensicTrace[]> {
    return this.tracer({ correlationId });
  }

  public async suivreRequest(requestId: string): Promise<AuditForensicTrace[]> {
    return this.tracer({ requestId });
  }

  public async suivreExports(filtres: { organisationId?: string; ecoleId?: string }): Promise<AuditForensicTrace[]> {
    return this.tracer({ ...filtres, categorieAudit: 'EXPORT' });
  }

  public async suivreSynchronisations(filtres: { organisationId?: string; ecoleId?: string }): Promise<AuditForensicTrace[]> {
    return this.tracer({ ...filtres, categorieAudit: 'SYNC' });
  }

  private async tracer(filtres: Record<string, unknown>): Promise<AuditForensicTrace[]> {
    const links = obtenirMemoireAuditStore().auditForensicLinks;
    return trierChronologiquementDesc(
      [...obtenirMemoireAuditStore().auditEntries.values()].filter((entree) =>
        appliquerFiltresAudit(entree, filtres as Parameters<typeof appliquerFiltresAudit>[1])),
    ).map((entree) => {
      const relation = links.find((link) => link.auditEntrySource === entree.obtenirId() || link.auditEntryCible === entree.obtenirId());
      return construireTraceForensic(entree, relation?.typeRelation);
    });
  }
}
