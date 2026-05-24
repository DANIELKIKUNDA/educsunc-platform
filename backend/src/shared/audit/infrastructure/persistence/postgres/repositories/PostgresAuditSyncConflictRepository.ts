import type { AuditSyncConflictRecord, AuditSyncConflictRepository } from '../../../../domain/repositories';
import { obtenirMemoireAuditStore } from './_memoireAuditStore';

// Ce repository historise les conflits de synchronisation avec leur cycle de resolution.
export class PostgresAuditSyncConflictRepository implements AuditSyncConflictRepository {
  public async enregistrerConflit(conflit: AuditSyncConflictRecord): Promise<void> {
    obtenirMemoireAuditStore().auditSyncConflicts.set(conflit.idAuditConflict, conflit);
  }

  public async retrouverConflit(idAuditConflict: string): Promise<AuditSyncConflictRecord | null> {
    return obtenirMemoireAuditStore().auditSyncConflicts.get(idAuditConflict) ?? null;
  }

  public async listerConflits(
    filtres?: { statutResolution?: string; organisationId?: string; ecoleId?: string },
  ): Promise<AuditSyncConflictRecord[]> {
    const store = obtenirMemoireAuditStore();
    return [...store.auditSyncConflicts.values()].filter((conflit) => {
      if (filtres?.statutResolution && conflit.statutResolution !== filtres.statutResolution) { return false; }
      if (!filtres?.organisationId && !filtres?.ecoleId) { return true; }
      const audit = store.auditEntries.get(conflit.idAuditEntry);
      if (!audit) { return false; }
      const tenant = audit.obtenirTenantAudit();
      if (filtres.organisationId && tenant.obtenirOrganisationId() !== filtres.organisationId) { return false; }
      if (filtres.ecoleId && tenant.obtenirEcoleId() !== filtres.ecoleId) { return false; }
      return true;
    });
  }

  public async suivreResolution(idAuditConflict: string, statutResolution: string, dateResolution?: Date): Promise<void> {
    const conflit = obtenirMemoireAuditStore().auditSyncConflicts.get(idAuditConflict);
    if (!conflit) {
      return;
    }
    conflit.statutResolution = statutResolution;
    conflit.dateResolution = dateResolution ?? new Date();
  }
}
