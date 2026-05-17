import { randomUUID } from 'node:crypto';
import type { ClientPostgresPaiementsFacturation } from '../depots/ClientPostgresPaiementsFacturation';

// Ce contexte porte l'identite technique et le client associe a une transaction ouverte.
export interface ContexteTransactionPostgresPaiements<
  TClient = ClientPostgresPaiementsFacturation,
> {
  idTransaction: string;
  clientTransactionnel: TClient;
}

// Ce contrat abstrait le cycle de vie technique d'une transaction PostgreSQL.
export interface TransactionManager<TClient = ClientPostgresPaiementsFacturation> {
  ouvrirTransaction(): Promise<ContexteTransactionPostgresPaiements<TClient>>;
  validerTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void>;
  annulerTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void>;
  libererTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void>;
}

// Ce contrat adapte une source de client transactionnel concret au gestionnaire de transaction.
export interface AdaptateurClientTransactionPostgresPaiements<
  TClient = ClientPostgresPaiementsFacturation,
> {
  creerClientTransactionnel(): Promise<TClient>;
  commencerTransaction(clientTransactionnel: TClient): Promise<void>;
  validerTransaction(clientTransactionnel: TClient): Promise<void>;
  annulerTransaction(clientTransactionnel: TClient): Promise<void>;
  libererClientTransactionnel(clientTransactionnel: TClient): Promise<void>;
}

// Ce gestionnaire orchestre le cycle de vie complet d'une transaction PostgreSQL paiements.
export class GestionnaireTransactionPostgresPaiements<
  TClient = ClientPostgresPaiementsFacturation,
> implements TransactionManager<TClient>
{
  // Ce constructeur injecte l'adaptateur technique qui sait ouvrir et fermer les transactions.
  constructor(
    private readonly adaptateurClientTransaction: AdaptateurClientTransactionPostgresPaiements<TClient>,
  ) {}

  // Cette methode ouvre une transaction PostgreSQL dediee.
  public async ouvrirTransaction(): Promise<ContexteTransactionPostgresPaiements<TClient>> {
    const clientTransactionnel =
      await this.adaptateurClientTransaction.creerClientTransactionnel();
    await this.adaptateurClientTransaction.commencerTransaction(
      clientTransactionnel,
    );

    return {
      idTransaction: randomUUID(),
      clientTransactionnel,
    };
  }

  // Cette methode valide la transaction ouverte.
  public async validerTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void> {
    await this.adaptateurClientTransaction.validerTransaction(
      contexteTransaction.clientTransactionnel,
    );
  }

  // Cette methode annule la transaction ouverte.
  public async annulerTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void> {
    await this.adaptateurClientTransaction.annulerTransaction(
      contexteTransaction.clientTransactionnel,
    );
  }

  // Cette methode libere les ressources du client transactionnel.
  public async libererTransaction(
    contexteTransaction: ContexteTransactionPostgresPaiements<TClient>,
  ): Promise<void> {
    await this.adaptateurClientTransaction.libererClientTransactionnel(
      contexteTransaction.clientTransactionnel,
    );
  }
}
