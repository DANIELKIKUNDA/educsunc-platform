import type { TransactionManager } from './TransactionManager';

// Cette unite de travail delegue l'execution atomique au gestionnaire transactionnel.
export class PostgresUnitOfWork implements TransactionManager {
  // Ce constructeur injecte le gestionnaire qui sait ouvrir et fermer les transactions SQL.
  constructor(private readonly gestionnaireTransaction: TransactionManager) {}

  // Cette methode execute une operation dans une unite de travail unique.
  public async executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    return await this.gestionnaireTransaction.executer(operation);
  }
}
