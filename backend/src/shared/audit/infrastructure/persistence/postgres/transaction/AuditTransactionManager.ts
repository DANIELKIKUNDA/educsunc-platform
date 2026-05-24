import type { AuditTransactionPort } from '../../../../application/ports/transaction';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { AuditPostCommitDispatcher } from './AuditPostCommitDispatcher';
import { AUDIT_TRANSACTION_CONTEXTS, type AuditTransactionContext, type AuditTransactionMode } from './AuditTransactionContext';

export interface ClientTransactionnelAudit extends SqlQueryClient {}

// Ce gestionnaire protege les transactions courtes Audit et laisse les projections/exports au post-commit.
export class AuditTransactionManager implements AuditTransactionPort {
  constructor(private readonly clientSql?: ClientTransactionnelAudit) {
    void this.clientSql;
  }

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }

  public async executerAvecContexte<TResult>(
    mode: AuditTransactionMode,
    operation: (contexte: AuditTransactionContext) => Promise<TResult>,
  ): Promise<TResult> {
    const contexte = AUDIT_TRANSACTION_CONTEXTS[mode];
    return this.executerDansTransaction(() => operation(contexte));
  }

  public async executerPuisPostCommit<TResult>(
    mode: AuditTransactionMode,
    operation: (dispatcher: AuditPostCommitDispatcher, contexte: AuditTransactionContext) => Promise<TResult>,
  ): Promise<TResult> {
    const dispatcher = new AuditPostCommitDispatcher();
    const contexte = AUDIT_TRANSACTION_CONTEXTS[mode];
    const resultat = await this.executerDansTransaction(() => operation(dispatcher, contexte));
    if (contexte.publierAsynchroneApresCommit) {
      await dispatcher.executerTous();
    } else {
      dispatcher.vider();
    }
    return resultat;
  }
}

