import type { AuditOfflineRepository, AuditSyncConflictRecord } from '../../../../domain/repositories';
import { construireConflitRecord } from './audit-repository.helpers';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository centralise les besoins offline-first, replay, retry et synchronisation.
export class PostgresAuditOfflineRepository implements AuditOfflineRepository {
  public async listerEnAttenteSynchronisation(): Promise<string[]> {
    return [...obtenirMemoireAuditStore().auditEntries.values()]
      .filter((entree) => {
        const offline = entree.obtenirAuditOfflineMetadata();
        return Boolean(offline) && !offline?.estSynchronise();
      })
      .map((entree) => entree.obtenirId());
  }

  public async listerConflits(): Promise<AuditSyncConflictRecord[]> {
    return [...obtenirMemoireAuditStore().auditSyncConflicts.values()];
  }

  public async listerReplays(): Promise<string[]> {
    return [...obtenirMemoireAuditStore().auditEntries.values()]
      .filter((entree) => entree.obtenirAuditOfflineMetadata()?.estReplay() === true)
      .map((entree) => entree.obtenirId());
  }

  public async listerRetries(): Promise<string[]> {
    return [...obtenirMemoireAuditStore().auditEntries.values()]
      .filter((entree) => entree.obtenirAuditOfflineMetadata()?.estRetry() === true)
      .map((entree) => entree.obtenirId());
  }

  public async listerSynchronisations(): Promise<string[]> {
    return [...obtenirMemoireAuditStore().auditEntries.values()]
      .filter((entree) => entree.obtenirAuditOfflineMetadata()?.estSynchronise() === true)
      .map((entree) => entree.obtenirId());
  }

  public async marquerSynchronise(idAudit: string, dateSynchronisation: Date): Promise<void> {
    void dateSynchronisation;
    const conflit = [...obtenirMemoireAuditStore().auditSyncConflicts.values()].find((ligne) => ligne.idAuditEntry === idAudit);
    if (conflit) {
      conflit.dateResolution = new Date();
      conflit.statutResolution = 'SYNCED';
    }
  }

  // Cette aide permet de garder une trace technique de conflit meme avant le bloc dedie.
  public async enregistrerConflitTechnique(idAuditEntry: string, typeConflit: string, descriptionConflit?: string): Promise<void> {
    const conflit = construireConflitRecord(idAuditEntry, typeConflit, descriptionConflit);
    obtenirMemoireAuditStore().auditSyncConflicts.set(conflit.idAuditConflict, conflit);
  }
}
