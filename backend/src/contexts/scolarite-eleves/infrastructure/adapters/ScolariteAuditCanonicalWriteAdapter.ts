import type { AuditEntry } from '../../../../shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from '../../../../shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from '../../../../shared/audit/application/outbox';
import { AuditCanonicalWriteService } from '../../../../shared/audit/application/services';
import { AuditCanonicalEventMapper } from '../../../../shared/audit/infrastructure/outbox';
import { PostgresAuditCanonicalStorage } from '../../../../shared/audit/infrastructure/persistence/postgres/repositories';
import type { ClientPostgresScolariteEleves } from '../persistence/postgres/depots/ClientPostgresScolariteEleves';
import type { PostgresUnitOfWork } from '../persistence/postgres/transaction/PostgresUnitOfWork';

// Cet adaptateur partage la transaction Scolarite avec l'ecriture canonique Audit.
export class ScolariteAuditCanonicalWriteAdapter implements AuditCanonicalWritePort {
  constructor(private readonly unitOfWork: PostgresUnitOfWork<ClientPostgresScolariteEleves>) {}

  public async ecrire(entree: AuditEntry, idempotencyKey: string): Promise<AuditCanonicalWriteResult> {
    return this.unitOfWork.executerDansTransaction(async () => {
      const contexte = this.unitOfWork.obtenirContexteTransactionCourant();
      if (!contexte) throw new Error('Le contexte transactionnel Scolarite est indisponible.');
      return new AuditCanonicalWriteService(
        new PostgresAuditCanonicalStorage(contexte.clientTransactionnel),
        new AuditCanonicalEventMapper(),
      ).ecrire(entree, idempotencyKey);
    });
  }
}
