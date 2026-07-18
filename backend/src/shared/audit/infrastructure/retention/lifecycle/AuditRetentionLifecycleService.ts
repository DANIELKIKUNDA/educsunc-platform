import { PostgresAuditEntryRepository } from '../../persistence/postgres/repositories/PostgresAuditEntryRepository';
import type { AuditRetentionCandidate } from '../RetentionTypes';

// Le cycle de vie trace l'évolution ACTIVE -> ARCHIVE -> COLD STORAGE -> PURGE.
export class AuditRetentionLifecycleService {
  public constructor(private readonly entries = new PostgresAuditEntryRepository()) {}

  public async listerCandidats(): Promise<AuditRetentionCandidate[]> {
    return (await this.entries.listerSelonFiltres({})).map((entry) => ({
      idAuditEntry: entry.obtenirId(),
      organisationId: entry.obtenirTenantAudit().obtenirOrganisationId(),
      ecoleId: entry.obtenirTenantAudit().obtenirEcoleId(),
      scope: entry.obtenirTenantAudit().obtenirScope().obtenirValeur(),
      dateAction: entry.obtenirHorodatageAudit().obtenirDateAction().toISOString(),
      lifecycleState: 'ACTIVE',
    }));
  }
}
