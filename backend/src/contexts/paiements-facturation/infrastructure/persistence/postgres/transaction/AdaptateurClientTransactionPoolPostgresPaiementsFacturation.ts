import { type Pool } from 'pg';
import {
  ClientPoolPostgresPaiementsFacturation,
  type FournisseurParametresSessionPostgresPaiementsFacturation,
} from '../ClientPoolPostgresPaiementsFacturation';
import type { AdaptateurClientTransactionPostgresPaiements } from './TransactionManager';

// Ce fichier adapte un pool PostgreSQL au protocole transactionnel attendu par le BC Paiements.
export class AdaptateurClientTransactionPoolPostgresPaiementsFacturation
  implements
    AdaptateurClientTransactionPostgresPaiements<ClientPoolPostgresPaiementsFacturation>
{
  // Ce constructeur injecte le pool et le fournisseur eventuel de parametres tenant de session.
  constructor(
    private readonly pool: Pool,
    private readonly fournisseurParametresSession?: FournisseurParametresSessionPostgresPaiementsFacturation,
  ) {}

  // Cette methode cree un client transactionnel dedie au cycle courant.
  public async creerClientTransactionnel(): Promise<ClientPoolPostgresPaiementsFacturation> {
    const clientTransactionnel = await this.pool.connect();

    return ClientPoolPostgresPaiementsFacturation.depuisClientTransactionnel(
      clientTransactionnel,
      this.fournisseurParametresSession,
    );
  }

  // Cette methode ouvre la transaction SQL sur le client dedie.
  public async commencerTransaction(
    clientTransactionnel: ClientPoolPostgresPaiementsFacturation,
  ): Promise<void> {
    await clientTransactionnel.commencerTransaction();
  }

  // Cette methode valide la transaction SQL en cours.
  public async validerTransaction(
    clientTransactionnel: ClientPoolPostgresPaiementsFacturation,
  ): Promise<void> {
    await clientTransactionnel.validerTransaction();
  }

  // Cette methode annule la transaction SQL en cours.
  public async annulerTransaction(
    clientTransactionnel: ClientPoolPostgresPaiementsFacturation,
  ): Promise<void> {
    await clientTransactionnel.annulerTransaction();
  }

  // Cette methode libere la connexion transactionnelle dediee.
  public async libererClientTransactionnel(
    clientTransactionnel: ClientPoolPostgresPaiementsFacturation,
  ): Promise<void> {
    await clientTransactionnel.liberer();
  }
}
