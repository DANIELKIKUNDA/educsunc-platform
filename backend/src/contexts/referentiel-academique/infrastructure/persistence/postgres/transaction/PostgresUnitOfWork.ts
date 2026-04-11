import { AsyncLocalStorage } from 'node:async_hooks';
import { ErreurTransactionApplication } from '../../../../application/exceptions/ErreurTransactionApplication';
import type { ServiceTransactionApplication } from '../../../../application/services/ServiceTransactionApplication';
import type { ContexteTransactionPostgres, TransactionManager } from './TransactionManager';

// Cette unite de travail declenche des transactions applicatives et expose le contexte technique courant.
export class PostgresUnitOfWork<TClient = unknown>
  implements ServiceTransactionApplication
{
  private readonly gestionnaireTransaction: TransactionManager<TClient>;
  private readonly stockageContexteTransaction = new AsyncLocalStorage<
    ContexteTransactionPostgres<TClient>
  >();

  // Ce constructeur injecte le gestionnaire technique responsable du cycle de vie transactionnel.
  constructor(gestionnaireTransaction: TransactionManager<TClient>) {
    this.gestionnaireTransaction = gestionnaireTransaction;
  }

  // Cette methode execute une operation applicative dans une transaction atomique.
  public async executerDansTransaction<TValeur>(
    operation: () => Promise<TValeur>,
  ): Promise<TValeur> {
    const contexteTransactionExistant = this.obtenirContexteTransactionCourant();

    if (contexteTransactionExistant !== null) {
      return operation();
    }

    const contexteTransaction = await this.ouvrirTransaction();
    let erreurExecution: unknown = null;

    try {
      const resultat = await this.stockageContexteTransaction.run(
        contexteTransaction,
        operation,
      );

      await this.validerTransaction(contexteTransaction);

      return resultat;
    } catch (erreur) {
      erreurExecution = erreur;
      await this.annulerTransaction(contexteTransaction, erreur);

      throw erreur;
    } finally {
      await this.libererTransaction(contexteTransaction, erreurExecution);
    }
  }

  // Cette methode retourne le contexte transactionnel courant lorsqu'une transaction est ouverte.
  public obtenirContexteTransactionCourant(): ContexteTransactionPostgres<TClient> | null {
    return this.stockageContexteTransaction.getStore() ?? null;
  }

  // Cette methode indique si l'execution courante se trouve deja dans une transaction ouverte.
  public estDansUneTransaction(): boolean {
    return this.obtenirContexteTransactionCourant() !== null;
  }

  // Cette methode ouvre une nouvelle transaction et convertit l'erreur technique en erreur applicative.
  private async ouvrirTransaction(): Promise<ContexteTransactionPostgres<TClient>> {
    try {
      return await this.gestionnaireTransaction.ouvrirTransaction();
    } catch (erreur) {
      throw this.creerErreurTransactionApplication(
        "L'ouverture de la transaction applicative a echoue.",
        'OUVERTURE_TRANSACTION_APPLICATION',
        erreur,
      );
    }
  }

  // Cette methode valide la transaction une fois l'operation applicative terminee avec succes.
  private async validerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.gestionnaireTransaction.validerTransaction(contexteTransaction);
    } catch (erreur) {
      throw this.creerErreurTransactionApplication(
        'La validation de la transaction applicative a echoue.',
        'VALIDATION_TRANSACTION_APPLICATION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  // Cette methode annule la transaction lorsque l'operation applicative echoue.
  private async annulerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
    erreurOrigine: unknown,
  ): Promise<void> {
    try {
      await this.gestionnaireTransaction.annulerTransaction(contexteTransaction);
    } catch (erreurAnnulation) {
      throw this.creerErreurTransactionApplication(
        "L'operation applicative a echoue et l'annulation de la transaction a egalement echoue.",
        'ANNULATION_TRANSACTION_APPLICATION',
        erreurAnnulation,
        contexteTransaction.idTransaction,
        erreurOrigine,
      );
    }
  }

  // Cette methode libere les ressources techniques quelle que soit l'issue de l'operation.
  private async libererTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
    erreurOrigine: unknown,
  ): Promise<void> {
    try {
      await this.gestionnaireTransaction.libererTransaction(contexteTransaction);
    } catch (erreurLiberation) {
      throw this.creerErreurTransactionApplication(
        'La liberation des ressources transactionnelles a echoue.',
        'LIBERATION_TRANSACTION_APPLICATION',
        erreurLiberation,
        contexteTransaction.idTransaction,
        erreurOrigine,
      );
    }
  }

  // Cette methode construit une erreur applicative coherente pour les echecs transactionnels.
  private creerErreurTransactionApplication(
    message: string,
    etape: string,
    erreurTechnique: unknown,
    idTransaction?: string,
    erreurOrigine?: unknown,
  ): ErreurTransactionApplication {
    return new ErreurTransactionApplication(message, {
      etape,
      idTransaction,
      erreurTechnique: this.decrireErreur(erreurTechnique),
      erreurOrigine: erreurOrigine === undefined ? undefined : this.decrireErreur(erreurOrigine),
    });
  }

  // Cette methode produit une description robuste d'une erreur inconnue.
  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
