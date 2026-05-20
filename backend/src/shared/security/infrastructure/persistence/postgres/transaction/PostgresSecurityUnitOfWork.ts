import { SecurityTransactionManager } from './SecurityTransactionManager';

// Cette unite de travail expose un point d'entree transactionnel simple pour SECURITY.
export class PostgresSecurityUnitOfWork {
  constructor(private readonly securityTransactionManager: SecurityTransactionManager) {}

  public async executer<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.securityTransactionManager.executerDansTransaction(operation);
  }
}
