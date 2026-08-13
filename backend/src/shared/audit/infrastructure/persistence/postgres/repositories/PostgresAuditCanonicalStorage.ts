import type { AuditEntry } from '../../../../domain/aggregates';
import type { AuditCanonicalEvent, AuditCanonicalWriteResult } from '../../../../application/outbox';
import type { AuditCanonicalStoragePort } from '../../../../application/ports/outbound';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { PostgresAuditEntryRepository } from './PostgresAuditEntryRepository';
import { PostgresAuditOutboxRepository } from './PostgresAuditOutboxRepository';
import { AuditEntryPersistenceMapper } from '../mappers/AuditEntryPersistenceMapper';
import { PostgresAuditIntegrityStore } from '../../../security/integrity/PostgresAuditIntegrityStore';

type TransactionalClient = SqlQueryClient & {
  dansTransaction?<T>(operation: () => Promise<T>): Promise<T>;
};

export class PostgresAuditCanonicalStorage implements AuditCanonicalStoragePort {
  private readonly entries: PostgresAuditEntryRepository;
  private readonly outbox: PostgresAuditOutboxRepository;
  private readonly integrity: PostgresAuditIntegrityStore;

  public constructor(private readonly client: TransactionalClient = obtenirClientPostgresAuth()) {
    this.entries = new PostgresAuditEntryRepository(client);
    this.outbox = new PostgresAuditOutboxRepository(client);
    this.integrity = new PostgresAuditIntegrityStore(client);
  }

  public async enregistrer(entree: AuditEntry, event: AuditCanonicalEvent): Promise<AuditCanonicalWriteResult> {
    return this.transaction(async () => {
      const outboxResult = await this.outbox.ajouter(event);
      if (outboxResult.duplicate) return outboxResult;
      await this.entries.ajouterAudit(entree);
      const rows = AuditEntryPersistenceMapper.versRows(entree);
      await this.integrity.sceller(rows.auditEntry, rows.categories);
      return outboxResult;
    });
  }

  private async transaction<T>(operation: () => Promise<T>): Promise<T> {
    return this.client.dansTransaction ? this.client.dansTransaction(operation) : operation();
  }
}
