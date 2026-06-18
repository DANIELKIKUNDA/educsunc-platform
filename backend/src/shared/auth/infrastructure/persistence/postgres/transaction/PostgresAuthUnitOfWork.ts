import { AuthTransactionManager } from './AuthTransactionManager';

// Cette unite de travail expose un point d'entree transactionnel simple pour AUTH.
export class PostgresAuthUnitOfWork {
  constructor(private readonly authTransactionManager: AuthTransactionManager) {}

  public async executer<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    return this.authTransactionManager.executerDansTransaction(operation);
  }
}
