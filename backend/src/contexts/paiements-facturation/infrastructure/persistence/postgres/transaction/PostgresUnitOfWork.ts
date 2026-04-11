import type { TransactionManager } from './TransactionManager';

// Placeholder de l'unite de travail PostgreSQL du contexte paiements facturation.
export class PostgresUnitOfWork implements TransactionManager {
  async executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    return operation();
  }
}
