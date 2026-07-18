import type { AuditArchiveRecord } from '../../../domain/repositories';
import { PostgresAuditDocumentStore } from '../../persistence/postgres/repositories/PostgresAuditDocumentStore';
import { PostgresAuditEntryRepository } from '../../persistence/postgres/repositories/PostgresAuditEntryRepository';
import type { AuditSecurityIncident } from '../SecurityTypes';

// Toute tentative de modification ou suppression anormale doit devenir détectable.
export class AuditAntiTamperingService {
  public constructor(
    private readonly documents = new PostgresAuditDocumentStore(),
    private readonly entries = new PostgresAuditEntryRepository(),
  ) {}

  public async detecter(): Promise<AuditSecurityIncident[]> {
    const incidents: AuditSecurityIncident[] = [];
    for (const archive of await this.documents.lister<AuditArchiveRecord>('ARCHIVE')) {
      if (!await this.entries.existe(archive.idAuditEntry)) {
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
