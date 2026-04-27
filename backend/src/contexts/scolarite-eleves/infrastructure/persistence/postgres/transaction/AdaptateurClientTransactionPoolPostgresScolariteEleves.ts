import { type Pool } from 'pg';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import {
  ClientPoolPostgresScolariteEleves,
  type FournisseurParametresSessionPostgresScolariteEleves,
} from '../ClientPoolPostgresScolariteEleves';
import type { ClientPostgresScolariteEleves } from '../depots/ClientPostgresScolariteEleves';
import type { AdaptateurClientTransactionPostgresScolarite } from './TransactionManager';

// Ce fichier adapte un pool PostgreSQL concret au gestionnaire de transaction scolarite.
/**
 * Cet adaptateur cree, ouvre, valide, annule et libere les clients transactionnels.
 */
export class AdaptateurClientTransactionPoolPostgresScolariteEleves
implements AdaptateurClientTransactionPostgresScolarite<ClientPostgresScolariteEleves> {
  constructor(
    private readonly pool: Pool,
    private readonly fournisseurParametresSession?:
      FournisseurParametresSessionPostgresScolariteEleves,
  ) {}

  /** Cree un client transactionnel dedie depuis le pool partage. */
  public async creerClientTransactionnel(): Promise<ClientPostgresScolariteEleves> {
    try {
      const clientTransactionnel = await this.pool.connect();

      return ClientPoolPostgresScolariteEleves.depuisClientTransactionnel(
        clientTransactionnel,
        this.fournisseurParametresSession,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La creation d'un client transactionnel scolarite a echoue.",
        'CREATION_CLIENT_TRANSACTIONNEL',
        erreur,
      );
    }
  }

  /** Ouvre la transaction SQL sur le client dedie. */
  public async ouvrirTransaction(
    clientTransactionnel: ClientPostgresScolariteEleves,
  ): Promise<void> {
    await this.validerClient(clientTransactionnel).commencerTransaction();
  }

  /** Commit la transaction SQL sur le client dedie. */
  public async validerTransaction(
    clientTransactionnel: ClientPostgresScolariteEleves,
  ): Promise<void> {
    await this.validerClient(clientTransactionnel).validerTransaction();
  }

  /** Rollback la transaction SQL sur le client dedie. */
  public async annulerTransaction(
    clientTransactionnel: ClientPostgresScolariteEleves,
  ): Promise<void> {
    await this.validerClient(clientTransactionnel).annulerTransaction();
  }

  /** Libere la connexion dediee apres usage transactionnel. */
  public async libererClientTransactionnel(
    clientTransactionnel: ClientPostgresScolariteEleves,
  ): Promise<void> {
    await this.validerClient(clientTransactionnel).liberer();
  }

  private validerClient(
    clientTransactionnel: ClientPostgresScolariteEleves,
  ): ClientPoolPostgresScolariteEleves {
    if (!(clientTransactionnel instanceof ClientPoolPostgresScolariteEleves)) {
      throw this.creerErreurInfrastructure(
        'Le client transactionnel scolarite fourni est incompatible avec le pool concret.',
        'CLIENT_TRANSACTIONNEL_INVALIDE',
      );
    }

    return clientTransactionnel;
  }

  private creerErreurInfrastructure(
    message: string,
    etape: string,
    erreur?: unknown,
  ): InfrastructureError {
    return new InfrastructureError(
      message,
      'ADAPTATEUR_TRANSACTION_POOL_POSTGRES_SCOLARITE_ELEVES',
      {
        etape,
        messageErreur: erreur instanceof Error ? erreur.message : String(erreur ?? 'Erreur inconnue'),
      },
    );
  }
}
