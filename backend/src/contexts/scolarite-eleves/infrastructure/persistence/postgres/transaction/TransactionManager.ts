import { randomUUID } from 'node:crypto';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';

// Ce fichier definit le contrat technique de transaction PostgreSQL du BC Scolarite des Eleves.
export interface ContexteTransactionPostgres<TClient = unknown> {
  idTransaction: string;
  clientTransactionnel: TClient;
}

/**
 * Cet adaptateur relie le gestionnaire de transaction au client PostgreSQL concret.
 */
export interface AdaptateurClientTransactionPostgresScolarite<TClient = unknown> {
  /** Cree un client dedie utilisable dans une transaction. */
  creerClientTransactionnel(): Promise<TClient>;
  /** Ouvre la transaction SQL sur le client dedie. */
  ouvrirTransaction(clientTransactionnel: TClient): Promise<void>;
  /** Commit la transaction SQL sur le client dedie. */
  validerTransaction(clientTransactionnel: TClient): Promise<void>;
  /** Rollback la transaction SQL sur le client dedie. */
  annulerTransaction(clientTransactionnel: TClient): Promise<void>;
  /** Libere la connexion dediee a la transaction. */
  libererClientTransactionnel(clientTransactionnel: TClient): Promise<void>;
}

/**
 * Ce gestionnaire ouvre, valide, annule et libere une transaction technique.
 */
export interface TransactionManager<TClient = unknown> {
  /** Ouvre une transaction et retourne le client transactionnel. */
  ouvrirTransaction(): Promise<ContexteTransactionPostgres<TClient>>;
  /** Commit la transaction ouverte. */
  validerTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;
  /** Rollback la transaction ouverte. */
  annulerTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;
  /** Libere les ressources associees a la transaction. */
  libererTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;
}

/**
 * Ce gestionnaire orchestre le cycle technique ouvrir, commit, rollback et liberation.
 */
export class GestionnaireTransactionPostgresScolarite<TClient = unknown>
implements TransactionManager<TClient> {
  constructor(
    private readonly adaptateurClientTransaction:
      AdaptateurClientTransactionPostgresScolarite<TClient>,
  ) {}

  /** Ouvre une transaction PostgreSQL et retourne son contexte technique. */
  public async ouvrirTransaction(): Promise<ContexteTransactionPostgres<TClient>> {
    const idTransaction = randomUUID();
    const clientTransactionnel = await this.adaptateurClientTransaction
      .creerClientTransactionnel();

    try {
      await this.adaptateurClientTransaction.ouvrirTransaction(clientTransactionnel);
      return { idTransaction, clientTransactionnel };
    } catch (erreur) {
      await this.libererClientSilencieusement(clientTransactionnel);
      throw this.creerErreurInfrastructure(
        "L'ouverture de la transaction PostgreSQL scolarite a echoue.",
        'OUVERTURE_TRANSACTION',
        erreur,
        idTransaction,
      );
    }
  }

  /** Valide une transaction deja ouverte. */
  public async validerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransaction.validerTransaction(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La validation de la transaction PostgreSQL scolarite a echoue.',
        'VALIDATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  /** Annule une transaction deja ouverte. */
  public async annulerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransaction.annulerTransaction(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "L'annulation de la transaction PostgreSQL scolarite a echoue.",
        'ANNULATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  /** Libere les ressources techniques de la transaction. */
  public async libererTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransaction.libererClientTransactionnel(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La liberation de la transaction PostgreSQL scolarite a echoue.',
        'LIBERATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  private async libererClientSilencieusement(clientTransactionnel: TClient): Promise<void> {
    try {
      await this.adaptateurClientTransaction
        .libererClientTransactionnel(clientTransactionnel);
    } catch {
      // Cette liberation defensive ne doit pas masquer l'erreur principale.
    }
  }

  private creerErreurInfrastructure(
    message: string,
    etape: string,
    erreur: unknown,
    idTransaction: string,
  ): InfrastructureError {
    return new InfrastructureError(message, 'TRANSACTION_POSTGRES_SCOLARITE_ELEVES', {
      etape,
      idTransaction,
      messageErreur: erreur instanceof Error ? erreur.message : String(erreur),
    });
  }
}
