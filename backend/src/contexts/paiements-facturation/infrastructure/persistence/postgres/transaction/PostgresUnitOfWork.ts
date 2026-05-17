import { AsyncLocalStorage } from 'node:async_hooks';
import type { UniteTravailPaiement } from '../../../../application/services/ServiceTransactionPaiement';
import type {
  ContexteTransactionPostgresPaiements,
  TransactionManager,
} from './TransactionManager';

// Cette unite de travail execute les operations applicatives de paiement dans une transaction atomique.
export class PostgresUnitOfWork<TClient = unknown>
  implements UniteTravailPaiement
{
  private readonly stockageContexteTransaction = new AsyncLocalStorage<
    ContexteTransactionPostgresPaiements<TClient>
  >();

  // Ce constructeur recoit le gestionnaire technique responsable de la transaction.
  constructor(
    private readonly gestionnaireTransaction: TransactionManager<TClient>,
  ) {}

  // Cette methode execute une operation applicative dans une transaction unique.
  public async executerDansTransaction<TSortie>(
    operation: () => Promise<TSortie>,
  ): Promise<TSortie> {
    const contexteExistant = this.obtenirContexteTransactionCourant();

    if (contexteExistant !== null) {
      return operation();
    }

    const contexteTransaction =
      await this.gestionnaireTransaction.ouvrirTransaction();
    let erreurExecution: unknown = null;

    try {
      const resultat = await this.stockageContexteTransaction.run(
        contexteTransaction,
        operation,
      );
      await this.gestionnaireTransaction.validerTransaction(
        contexteTransaction,
      );

      return resultat;
    } catch (erreur) {
      erreurExecution = erreur;
      await this.gestionnaireTransaction.annulerTransaction(
        contexteTransaction,
      );
      throw erreur;
    } finally {
      await this.gestionnaireTransaction.libererTransaction(
        contexteTransaction,
      );

      void erreurExecution;
    }
  }

  // Cette methode retourne le contexte transactionnel courant quand il existe.
  public obtenirContexteTransactionCourant():
    | ContexteTransactionPostgresPaiements<TClient>
    | null {
    return this.stockageContexteTransaction.getStore() ?? null;
  }
}
