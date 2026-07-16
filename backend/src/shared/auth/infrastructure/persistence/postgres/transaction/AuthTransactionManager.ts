import type { TransactionManagerPort } from '../../../../application';
import { ClientPoolPostgresAuth, obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';

// Ce gestionnaire partage la transaction PostgreSQL avec tous les repositories AUTH.
export class AuthTransactionManager implements TransactionManagerPort {
  constructor(private readonly clientSql: ClientPoolPostgresAuth = obtenirClientPostgresAuth()) {}

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.clientSql.dansTransaction(operation);
  }
}
