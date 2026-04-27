import { AsyncLocalStorage } from 'node:async_hooks';
import { ErreurTransaction } from '../../../../application/exceptions/ErreurTransaction';
import type { ServiceTransactionApplication } from '../../../../application/services/ServiceTransactionApplication';
import type { ContexteTransactionPostgres, TransactionManager } from './TransactionManager';

// Ce fichier implemente l'unite de travail PostgreSQL du BC Scolarite des Eleves.
/**
 * Cette unite de travail ouvre une transaction en couche application et la partage aux depots.
 */
export class PostgresUnitOfWork<TClient = unknown> implements ServiceTransactionApplication {
  private readonly stockageContexteTransaction = new AsyncLocalStorage<ContexteTransactionPostgres<TClient>>();

  constructor(private readonly gestionnaireTransaction: TransactionManager<TClient>) {}

  /** Execute une operation applicative dans une transaction atomique. */
  public async executerDansTransaction<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    const transactionExistante = this.obtenirContexteTransactionCourant();

    if (transactionExistante !== null) {
      return operation();
    }

    const contexteTransaction = await this.gestionnaireTransaction.ouvrirTransaction();

    try {
      const resultat = await this.stockageContexteTransaction.run(contexteTransaction, operation);
      await this.gestionnaireTransaction.validerTransaction(contexteTransaction);
      return resultat;
    } catch (erreur) {
      await this.gestionnaireTransaction.annulerTransaction(contexteTransaction).catch(() => undefined);
      throw erreur;
    } finally {
      await this.gestionnaireTransaction.libererTransaction(contexteTransaction).catch((erreur) => {
        throw new ErreurTransaction(`La liberation de la transaction ${contexteTransaction.idTransaction} a echoue: ${String(erreur)}`);
      });
    }
  }

  /** Retourne le contexte transactionnel courant lorsqu'il existe. */
  public obtenirContexteTransactionCourant(): ContexteTransactionPostgres<TClient> | null {
    return this.stockageContexteTransaction.getStore() ?? null;
  }

  /** Indique si l'execution courante est deja transactionnelle. */
  public estDansUneTransaction(): boolean {
    return this.obtenirContexteTransactionCourant() !== null;
  }
}
