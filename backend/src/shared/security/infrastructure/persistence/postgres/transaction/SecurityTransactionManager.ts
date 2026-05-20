import type { SecurityTransactionPort } from '../../../../application';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';

export interface ClientTransactionnelSecurity extends SqlQueryClient {}

// Ce gestionnaire ouvre une transaction logique autour des operations SECURITY.
export class SecurityTransactionManager implements SecurityTransactionPort {
  constructor(private readonly clientSql?: ClientTransactionnelSecurity) {
    void this.clientSql;
  }

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return operation();
  }
}
