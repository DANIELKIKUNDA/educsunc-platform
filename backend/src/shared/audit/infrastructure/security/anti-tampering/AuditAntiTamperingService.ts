import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import type { AuditSecurityIncident } from '../SecurityTypes';

// Toute tentative de modification ou suppression anormale doit devenir détectable.
export class AuditAntiTamperingService {
  public detecter(): AuditSecurityIncident[] {
    const incidents: AuditSecurityIncident[] = [];
    const store = obtenirMemoireAuditStore();
    for (const archive of store.auditArchives.values()) {
      if (!store.auditEntries.has(archive.idAuditEntry)) {
        incidents.push({
          code: 'ARCHIVE_SOURCE_MISSING',
          message: `L archive ${archive.idArchive} pointe vers une entrée active absente.`,
          severite: 'AVERTISSEMENT',
          contexte: { idArchive: archive.idArchive, idAuditEntry: archive.idAuditEntry },
        });
      }
    }
    return incidents;
  }
}
