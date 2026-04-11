import { randomUUID } from 'node:crypto';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';

// Ce contexte represente les informations techniques d'une transaction PostgreSQL ouverte.
export interface ContexteTransactionPostgres<TClient = unknown> {
  readonly idTransaction: string;
  readonly ouverteLe: Date;
  readonly clientTransactionnel: TClient;
}

// Cet adaptateur relie le gestionnaire transactionnel a un client PostgreSQL concret.
export interface AdaptateurClientTransactionPostgres<TClient = unknown> {
  // Cette methode cree ou recupere un client utilisable pour une transaction.
  creerClientTransactionnel(): Promise<TClient>;

  // Cette methode ouvre la transaction sur le client concret.
  ouvrirTransaction(clientTransactionnel: TClient): Promise<void>;

  // Cette methode valide la transaction sur le client concret.
  validerTransaction(clientTransactionnel: TClient): Promise<void>;

  // Cette methode annule la transaction sur le client concret.
  annulerTransaction(clientTransactionnel: TClient): Promise<void>;

  // Cette methode libere le client concret une fois la transaction terminee.
  libererClientTransactionnel(clientTransactionnel: TClient): Promise<void>;
}

// Ce contrat definit les primitives techniques de gestion d'une transaction PostgreSQL.
export interface TransactionManager<TClient = unknown> {
  // Cette methode ouvre une transaction et retourne son contexte technique.
  ouvrirTransaction(): Promise<ContexteTransactionPostgres<TClient>>;

  // Cette methode valide une transaction ouverte.
  validerTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;

  // Cette methode annule une transaction ouverte.
  annulerTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;

  // Cette methode libere les ressources techniques d'une transaction terminee.
  libererTransaction(contexteTransaction: ContexteTransactionPostgres<TClient>): Promise<void>;
}

// Cette implementation gere le cycle de vie technique d'une transaction PostgreSQL.
export class GestionnaireTransactionPostgres<TClient = unknown>
  implements TransactionManager<TClient>
{
  private readonly adaptateurClientTransactionPostgres: AdaptateurClientTransactionPostgres<TClient>;

  // Ce constructeur injecte l'adaptateur concret du client transactionnel PostgreSQL.
  constructor(adaptateurClientTransactionPostgres: AdaptateurClientTransactionPostgres<TClient>) {
    this.adaptateurClientTransactionPostgres = adaptateurClientTransactionPostgres;
  }

  // Cette methode ouvre une transaction concrete et retourne le contexte associe.
  public async ouvrirTransaction(): Promise<ContexteTransactionPostgres<TClient>> {
    const idTransaction = randomUUID();
    const clientTransactionnel = await this.creerClientTransactionnel(idTransaction);

    try {
      await this.adaptateurClientTransactionPostgres.ouvrirTransaction(clientTransactionnel);

      return {
        idTransaction,
        ouverteLe: new Date(),
        clientTransactionnel,
      };
    } catch (erreur) {
      await this.libererClientSilencieusement(clientTransactionnel);

      throw this.creerErreurInfrastructure(
        "L'ouverture de la transaction PostgreSQL a echoue.",
        'OUVERTURE_TRANSACTION',
        erreur,
        idTransaction,
      );
    }
  }

  // Cette methode valide une transaction concrete deja ouverte.
  public async validerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransactionPostgres.validerTransaction(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La validation de la transaction PostgreSQL a echoue.',
        'VALIDATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  // Cette methode annule une transaction concrete deja ouverte.
  public async annulerTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransactionPostgres.annulerTransaction(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "L'annulation de la transaction PostgreSQL a echoue.",
        'ANNULATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  // Cette methode libere les ressources associees a une transaction terminee.
  public async libererTransaction(
    contexteTransaction: ContexteTransactionPostgres<TClient>,
  ): Promise<void> {
    try {
      await this.adaptateurClientTransactionPostgres.libererClientTransactionnel(
        contexteTransaction.clientTransactionnel,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La liberation du client transactionnel PostgreSQL a echoue.',
        'LIBERATION_TRANSACTION',
        erreur,
        contexteTransaction.idTransaction,
      );
    }
  }

  // Cette methode cree le client transactionnel avant ouverture de la transaction.
  private async creerClientTransactionnel(idTransaction: string): Promise<TClient> {
    try {
      return await this.adaptateurClientTransactionPostgres.creerClientTransactionnel();
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La creation du client transactionnel PostgreSQL a echoue.',
        'CREATION_CLIENT_TRANSACTIONNEL',
        erreur,
        idTransaction,
      );
    }
  }

  // Cette methode libere silencieusement le client si l'ouverture de transaction echoue.
  private async libererClientSilencieusement(clientTransactionnel: TClient): Promise<void> {
    try {
      await this.adaptateurClientTransactionPostgres.libererClientTransactionnel(
        clientTransactionnel,
      );
    } catch {
      // Cette liberation defensive ne doit pas masquer l'erreur principale.
    }
  }

  // Cette methode construit une erreur d'infrastructure coherente pour le cycle transactionnel.
  private creerErreurInfrastructure(
    message: string,
    etape: string,
    erreur: unknown,
    idTransaction: string,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      'ERREUR_TRANSACTION_POSTGRES',
      {
        etape,
        idTransaction,
        messageErreur: this.decrireErreur(erreur),
      },
    );
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
