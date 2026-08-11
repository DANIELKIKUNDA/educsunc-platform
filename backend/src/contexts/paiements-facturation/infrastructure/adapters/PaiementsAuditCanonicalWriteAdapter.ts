import type { AuditEntry } from '../../../../shared/audit/domain/aggregates';
import type {
  AuditCanonicalWritePort,
} from '../../../../shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from '../../../../shared/audit/application/outbox';
import { AuditCanonicalWriteService } from '../../../../shared/audit/application/services';
import { AuditCanonicalEventMapper } from '../../../../shared/audit/infrastructure/outbox';
import { PostgresAuditCanonicalStorage } from '../../../../shared/audit/infrastructure/persistence/postgres/repositories';
import type { ClientPostgresPaiementsFacturation } from '../persistence/postgres/depots/ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../persistence/postgres/transaction/PostgresUnitOfWork';

// Cet adaptateur partage la transaction paiement avec l'ecriture canonique Audit.
export class PaiementsAuditCanonicalWriteAdapter implements AuditCanonicalWritePort {
  public constructor(
    private readonly unitOfWork: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
  ) {}

  public async ecrire(entree: AuditEntry, idempotencyKey: string): Promise<AuditCanonicalWriteResult> {
    return this.unitOfWork.executerDansTransaction(async () => {
      const context = this.unitOfWork.obtenirContexteTransactionCourant();
      if (!context) throw new Error("Le contexte transactionnel Paiements est indisponible.");
      const service = new AuditCanonicalWriteService(
        new PostgresAuditCanonicalStorage(context.clientTransactionnel),
        new AuditCanonicalEventMapper(),
      );
      return service.ecrire(entree, idempotencyKey);
    });
  }
}
