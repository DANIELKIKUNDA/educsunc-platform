import { AuditTransactionManager } from './AuditTransactionManager';
import type { AuditTransactionMode } from './AuditTransactionContext';
import type { AuditPostCommitDispatcher } from './AuditPostCommitDispatcher';

// Cette unite de travail expose un point d entree simple pour les workflows transactionnels Audit.
export class PostgresAuditUnitOfWork {
  constructor(private readonly auditTransactionManager: AuditTransactionManager) {}

  public async executer<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.auditTransactionManager.executerDansTransaction(operation);
  }

  public async executerAvecMode<TResult>(
    mode: AuditTransactionMode,
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    return this.auditTransactionManager.executerAvecContexte(mode, () => operation());
  }

  public async executerPuisPostCommit<TResult>(
    mode: AuditTransactionMode,
    operation: (dispatcher: AuditPostCommitDispatcher) => Promise<TResult>,
  ): Promise<TResult> {
    return this.auditTransactionManager.executerPuisPostCommit(mode, (dispatcher) => operation(dispatcher));
  }
}

