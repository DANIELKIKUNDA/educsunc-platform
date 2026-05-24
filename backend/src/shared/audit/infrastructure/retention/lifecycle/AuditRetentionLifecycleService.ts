import { obtenirMemoireAuditStore } from '../../persistence/postgres/repositories/_memoireAuditStore';
import type { AuditRetentionCandidate } from '../RetentionTypes';

// Le cycle de vie trace l'évolution ACTIVE -> ARCHIVE -> COLD STORAGE -> PURGE.
export class AuditRetentionLifecycleService {
  public listerCandidats(): AuditRetentionCandidate[] {
    const store = obtenirMemoireAuditStore();
    return [...store.auditEntries.values()].map((entry) => ({
      idAuditEntry: entry.obtenirId(),
      organisationId: entry.obtenirTenantAudit().obtenirOrganisationId(),
      ecoleId: entry.obtenirTenantAudit().obtenirEcoleId(),
      scope: entry.obtenirTenantAudit().obtenirScope().obtenirValeur(),
      dateAction: entry.obtenirHorodatageAudit().obtenirDateAction().toISOString(),
      lifecycleState: 'ACTIVE',
    }));
  }
}
