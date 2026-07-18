import type { AuditOfflineRepository, AuditSyncConflictRecord } from '../../../../domain/repositories';
import { construireConflitRecord } from './audit-repository.helpers';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';
import { PostgresAuditSyncConflictRepository } from './PostgresAuditSyncConflictRepository';

export class PostgresAuditOfflineRepository implements AuditOfflineRepository {
  public constructor(
    private readonly entries = new PostgresAuditEntryRepository(),
    private readonly conflits = new PostgresAuditSyncConflictRepository(),
    private readonly documents = new PostgresAuditDocumentStore(),
  ) {}

  public async listerEnAttenteSynchronisation(): Promise<string[]> {
    const synchronises = new Set((await this.documents.lister<{ idAudit: string }>('SYNC_STATE')).map((etat) => etat.idAudit));
    return (await this.entries.listerSelonFiltres({ modeOffline: true }))
      .filter((entree) => !entree.obtenirAuditOfflineMetadata()?.estSynchronise() && !synchronises.has(entree.obtenirId()))
      .map((entree) => entree.obtenirId());
  }

  public listerConflits(): Promise<AuditSyncConflictRecord[]> { return this.conflits.listerConflits(); }
  public async listerReplays(): Promise<string[]> { return (await this.entries.listerSelonFiltres({ replay: true })).map((e) => e.obtenirId()); }
  public async listerRetries(): Promise<string[]> { return (await this.entries.listerSelonFiltres({ retry: true })).map((e) => e.obtenirId()); }
  public async listerSynchronisations(): Promise<string[]> {
    const natives = (await this.entries.listerSelonFiltres({ synchronise: true })).map((e) => e.obtenirId());
    const durables = (await this.documents.lister<{ idAudit: string }>('SYNC_STATE')).map((etat) => etat.idAudit);
    return [...new Set([...natives, ...durables])];
  }

  public async marquerSynchronise(idAudit: string, dateSynchronisation: Date): Promise<void> {
    await this.documents.enregistrer('SYNC_STATE', idAudit, { idAudit, dateSynchronisation });
    const conflit = (await this.conflits.listerConflits()).find((ligne) => ligne.idAuditEntry === idAudit);
    if (conflit) await this.conflits.suivreResolution(conflit.idAuditConflict, 'SYNCED', dateSynchronisation);
  }

  public async enregistrerConflitTechnique(idAuditEntry: string, typeConflit: string, descriptionConflit?: string): Promise<void> {
    await this.conflits.enregistrerConflit(construireConflitRecord(idAuditEntry, typeConflit, descriptionConflit));
  }
}
