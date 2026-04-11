import type { TransactionManager } from './TransactionManager';

// Placeholder de l'unite de travail PostgreSQL du contexte scolarite eleves.
export class PostgresUnitOfWork implements TransactionManager {
  async executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    return operation();
  }
}
