import type { SecurityTransactionPort } from '../../../../application';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';
import { ClientPoolPostgresAuth, obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

export interface ClientTransactionnelSecurity extends SqlQueryClient {}

// Ce gestionnaire ouvre une transaction logique autour des operations SECURITY.
export class SecurityTransactionManager implements SecurityTransactionPort {
  constructor(private readonly clientSql: ClientTransactionnelSecurity = obtenirClientPostgresAuth()) {}

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    if (this.clientSql instanceof ClientPoolPostgresAuth) {
      return this.clientSql.dansTransaction(operation);
    }
    return operation();
  }
}
