import type { AuditForensicRepository, AuditForensicTrace } from '../../../../domain/repositories';
import { construireTraceForensic } from './audit-repository.helpers';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';

// Ce repository concentre les lectures d'investigation et de correlation avancee.
export class PostgresAuditForensicRepository implements AuditForensicRepository {
  public constructor(private readonly entries = new PostgresAuditEntryRepository()) {}
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
    return (await this.entries.listerSelonFiltres(filtres)).map((entree) => construireTraceForensic(entree));
  }
}
