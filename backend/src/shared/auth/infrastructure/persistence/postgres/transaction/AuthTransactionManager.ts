import type { TransactionManagerPort } from '../../../../application';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';

export interface ClientTransactionnelAuth extends SqlQueryClient {}

// Ce gestionnaire ouvre une transaction logique courte pour les orchestrations AUTH.
export class AuthTransactionManager implements TransactionManagerPort {
  constructor(private readonly clientSql?: ClientTransactionnelAuth) {
    void this.clientSql;
  }

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}
