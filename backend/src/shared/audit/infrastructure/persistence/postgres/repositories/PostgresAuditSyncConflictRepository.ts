import type { AuditSyncConflictRecord, AuditSyncConflictRepository } from '../../../../domain/repositories';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';

export class PostgresAuditSyncConflictRepository implements AuditSyncConflictRepository {
  public constructor(
    private readonly documents = new PostgresAuditDocumentStore(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async enregistrerConflit(conflit: AuditSyncConflictRecord): Promise<void> {
    await this.documents.enregistrer('SYNC_CONFLICT', conflit.idAuditConflict, conflit);
  }

  public retrouverConflit(idAuditConflict: string): Promise<AuditSyncConflictRecord | null> {
    return this.documents.obtenir('SYNC_CONFLICT', idAuditConflict);
  }

  public async listerConflits(
    filtres?: { statutResolution?: string; organisationId?: string; ecoleId?: string },
  ): Promise<AuditSyncConflictRecord[]> {
    const conflits = await this.documents.lister<AuditSyncConflictRecord>('SYNC_CONFLICT');
    const resultats: AuditSyncConflictRecord[] = [];
    for (const conflit of conflits) {
      if (filtres?.statutResolution && conflit.statutResolution !== filtres.statutResolution) continue;
      if (filtres?.organisationId || filtres?.ecoleId) {
        const audit = await this.entries.trouverParId(conflit.idAuditEntry);
        if (!audit) continue;
        const tenant = audit.obtenirTenantAudit();
        if (filtres.organisationId && tenant.obtenirOrganisationId() !== filtres.organisationId) continue;
        if (filtres.ecoleId && tenant.obtenirEcoleId() !== filtres.ecoleId) continue;
      }
      resultats.push(conflit);
    }
    return resultats;
  }

  public async suivreResolution(idAuditConflict: string, statutResolution: string, dateResolution?: Date): Promise<void> {
    const conflit = await this.retrouverConflit(idAuditConflict);
    if (!conflit) return;
    await this.enregistrerConflit({ ...conflit, statutResolution, dateResolution: dateResolution ?? new Date() });
  }
}
