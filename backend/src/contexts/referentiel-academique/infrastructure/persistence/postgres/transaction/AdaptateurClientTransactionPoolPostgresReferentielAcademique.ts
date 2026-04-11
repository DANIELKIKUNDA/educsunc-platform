import { type Pool } from 'pg';
import { InfrastructureError } from '../../../../../../shared/exceptions/InfrastructureError';
import {
  ClientPoolPostgresReferentielAcademique,
  FournisseurParametresSessionPostgresReferentielAcademique,
} from '../ClientPoolPostgresReferentielAcademique';
import type { ClientPostgresReferentielAcademique } from '../depots/ClientPostgresReferentielAcademique';
import type { AdaptateurClientTransactionPostgres } from './TransactionManager';

// Cet adaptateur relie le gestionnaire de transaction a un pool PostgreSQL concret.
export class AdaptateurClientTransactionPoolPostgresReferentielAcademique
  implements AdaptateurClientTransactionPostgres<ClientPostgresReferentielAcademique>
{
  private readonly pool: Pool;
  private readonly fournisseurParametresSession?:
    FournisseurParametresSessionPostgresReferentielAcademique;

  // Ce constructeur injecte le pool PostgreSQL partage.
  constructor(
    pool: Pool,
    fournisseurParametresSession?:
      FournisseurParametresSessionPostgresReferentielAcademique,
  ) {
    this.pool = pool;
    this.fournisseurParametresSession = fournisseurParametresSession;
  }

  // Cette methode cree un client dedie a une transaction.
  public async creerClientTransactionnel(): Promise<ClientPostgresReferentielAcademique> {
    try {
      const clientTransactionnel = await this.pool.connect();

      return ClientPoolPostgresReferentielAcademique.depuisClientTransactionnel(
        clientTransactionnel,
        this.fournisseurParametresSession,
      );
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "La creation d'un client transactionnel PostgreSQL a echoue.",
        'CREATION_CLIENT_TRANSACTIONNEL_POSTGRES',
        erreur,
      );
    }
  }

  // Cette methode ouvre la transaction SQL sur le client dedie.
  public async ouvrirTransaction(
    clientTransactionnel: ClientPostgresReferentielAcademique,
  ): Promise<void> {
    const clientValide = this.validerClient(clientTransactionnel);
    await clientValide.commencerTransaction();
  }

  // Cette methode valide la transaction SQL sur le client dedie.
  public async validerTransaction(
    clientTransactionnel: ClientPostgresReferentielAcademique,
  ): Promise<void> {
    const clientValide = this.validerClient(clientTransactionnel);
    await clientValide.validerTransaction();
  }

  // Cette methode annule la transaction SQL sur le client dedie.
  public async annulerTransaction(
    clientTransactionnel: ClientPostgresReferentielAcademique,
  ): Promise<void> {
    const clientValide = this.validerClient(clientTransactionnel);
    await clientValide.annulerTransaction();
  }

  // Cette methode libere la connexion dediee a la transaction.
  public async libererClientTransactionnel(
    clientTransactionnel: ClientPostgresReferentielAcademique,
  ): Promise<void> {
    const clientValide = this.validerClient(clientTransactionnel);
    await clientValide.liberer();
  }

  private validerClient(
    clientTransactionnel: ClientPostgresReferentielAcademique,
  ): ClientPoolPostgresReferentielAcademique {
    if (!(clientTransactionnel instanceof ClientPoolPostgresReferentielAcademique)) {
      throw this.creerErreurInfrastructure(
        'Le client transactionnel fourni n est pas compatible avec le pool PostgreSQL concret.',
        'CLIENT_TRANSACTIONNEL_POSTGRES_INVALIDE',
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
      'ADAPTATEUR_TRANSACTION_POOL_POSTGRES_REFERENTIEL_ACADEMIQUE',
      {
        etape,
        messageErreur: this.decrireErreur(erreur),
      },
    );
  }

  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) {
      return erreur.message;
    }

    if (typeof erreur === 'string') {
      return erreur;
    }

    if (erreur === undefined) {
      return 'Erreur inconnue';
    }

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}
