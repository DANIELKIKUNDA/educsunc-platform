import { Pool, type PoolClient } from 'pg';
import { configurationBaseDonnees } from '../../../../../config/database.config';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import type {
  ClientPostgresScolariteEleves,
  ResultatExecutionPostgresScolarite,
} from './depots/ClientPostgresScolariteEleves';

// Ce fichier fournit le client PostgreSQL concret utilise par le BC Scolarite des Eleves.
export interface ParametresSessionPostgresScolariteEleves {
  tenantId: string | null;
  organisationId: string | null;
  lectureOrganisationnelle: boolean;
}

// Ce fournisseur expose les parametres tenant a appliquer sur chaque session PostgreSQL.
export interface FournisseurParametresSessionPostgresScolariteEleves {
  obtenirParametresSession(): ParametresSessionPostgresScolariteEleves;
}

// Cette interface represente la configuration technique du pool PostgreSQL de scolarite.
export interface ConfigurationPoolPostgresScolariteEleves {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  maxConnexions?: number;
  temporisationIdleMs?: number;
  temporisationConnexionMs?: number;
  ssl?: boolean;
}

/**
 * Cette classe adapte un Pool PostgreSQL ou un client transactionnel au contrat des depots.
 */
export class ClientPoolPostgresScolariteEleves implements ClientPostgresScolariteEleves {
  constructor(
    private readonly executantRequetes: Pool | PoolClient,
    private readonly estTransactionnel = false,
    private readonly liberateur?: () => void,
    private readonly fournisseurParametresSession?:
      FournisseurParametresSessionPostgresScolariteEleves,
  ) {}

  /** Cree un client de lecture base sur un pool partage. */
  public static depuisPool(
    pool: Pool,
    fournisseurParametresSession?: FournisseurParametresSessionPostgresScolariteEleves,
  ): ClientPoolPostgresScolariteEleves {
    return new ClientPoolPostgresScolariteEleves(
      pool,
      false,
      undefined,
      fournisseurParametresSession,
    );
  }

  /** Cree un client transactionnel base sur une connexion dediee. */
  public static depuisClientTransactionnel(
    clientTransactionnel: PoolClient,
    fournisseurParametresSession?: FournisseurParametresSessionPostgresScolariteEleves,
  ): ClientPoolPostgresScolariteEleves {
    return new ClientPoolPostgresScolariteEleves(
      clientTransactionnel,
      true,
      () => clientTransactionnel.release(),
      fournisseurParametresSession,
    );
  }

  /** Execute une requete SQL et retourne un resultat normalise pour les depots. */
  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionPostgresScolarite<TLigne>> {
    const parametresSession = this.fournisseurParametresSession?.obtenirParametresSession();

    try {
      if (this.estTransactionnel) {
        const clientTransactionnel = this.executantRequetes as PoolClient;
        await this.appliquerParametresSession(clientTransactionnel, parametresSession);
        const resultat = await clientTransactionnel.query(requeteSql, [...parametres]);

        return {
          lignes: resultat.rows as readonly TLigne[],
          nombreLignesAffectees: resultat.rowCount ?? 0,
        };
      }

      if (parametresSession !== undefined) {
        const clientDedie = await (this.executantRequetes as Pool).connect();

        try {
          await this.appliquerParametresSession(clientDedie, parametresSession);
          const resultat = await clientDedie.query(requeteSql, [...parametres]);

          return {
            lignes: resultat.rows as readonly TLigne[],
            nombreLignesAffectees: resultat.rowCount ?? 0,
          };
        } finally {
          clientDedie.release();
        }
      }

      const resultat = await this.executantRequetes.query(requeteSql, [...parametres]);

      return {
        lignes: resultat.rows as readonly TLigne[],
        nombreLignesAffectees: resultat.rowCount ?? 0,
      };
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        "L'execution d'une requete PostgreSQL scolarite a echoue.",
        'EXECUTION_REQUETE_POSTGRES_SCOLARITE',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  /** Ouvre une transaction SQL explicite sur un client dedie. */
  public async commencerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('BEGIN', 'OUVERTURE_TRANSACTION_POSTGRES');
  }

  /** Valide la transaction SQL courante. */
  public async validerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('COMMIT', 'VALIDATION_TRANSACTION_POSTGRES');
  }

  /** Annule la transaction SQL courante. */
  public async annulerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('ROLLBACK', 'ANNULATION_TRANSACTION_POSTGRES');
  }

  /** Libere la connexion dediee lorsqu'il s'agit d'un client transactionnel. */
  public async liberer(): Promise<void> {
    if (this.liberateur === undefined) {
      return;
    }

    try {
      this.liberateur();
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La liberation du client PostgreSQL scolarite a echoue.',
        'LIBERATION_CLIENT_POSTGRES_SCOLARITE',
        undefined,
        [],
        erreur,
      );
    }
  }

  private async executerCommandeTransactionnelle(
    commandeSql: 'BEGIN' | 'COMMIT' | 'ROLLBACK',
    etape: string,
  ): Promise<void> {
    if (!this.estTransactionnel) {
      throw this.creerErreurInfrastructure(
        'Une commande transactionnelle exige un client transactionnel dedie.',
        'CLIENT_TRANSACTIONNEL_REQUIS',
        commandeSql,
      );
    }

    try {
      await this.executantRequetes.query(commandeSql);
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        `La commande transactionnelle ${commandeSql} a echoue.`,
        etape,
        commandeSql,
        [],
        erreur,
      );
    }
  }

  private async appliquerParametresSession(
    client: PoolClient,
    parametresSession?: ParametresSessionPostgresScolariteEleves,
  ): Promise<void> {
    if (parametresSession === undefined) {
      return;
    }

    await client.query(
      [
        'SELECT',
        `set_config('educsyn.tenant_id', $1, false),`,
        `set_config('educsyn.organisation_id', $2, false),`,
        `set_config('educsyn.lecture_organisationnelle', $3, false)`,
      ].join(' '),
      [
        parametresSession.tenantId ?? '',
        parametresSession.organisationId ?? '',
        parametresSession.lectureOrganisationnelle ? 'true' : 'false',
      ],
    );
  }

  private creerErreurInfrastructure(
    message: string,
    etape: string,
    requeteSql?: string,
    parametres: readonly unknown[] = [],
    erreur?: unknown,
  ): InfrastructureError {
    return new InfrastructureError(message, 'CLIENT_POOL_POSTGRES_SCOLARITE_ELEVES', {
      etape,
      requeteSql,
      parametres,
      messageErreur: this.decrireErreur(erreur),
    });
  }

  private decrireErreur(erreur: unknown): string {
    if (erreur instanceof Error) return erreur.message;
    if (typeof erreur === 'string') return erreur;
    if (erreur === undefined) return 'Erreur inconnue';

    try {
      return JSON.stringify(erreur);
    } catch {
      return 'Erreur inconnue';
    }
  }
}

// Cette fonction construit la configuration PostgreSQL du BC depuis la configuration backend.
export function creerConfigurationPoolPostgresScolariteEleves(
  surcharge: Partial<ConfigurationPoolPostgresScolariteEleves> = {},
): ConfigurationPoolPostgresScolariteEleves {
  return {
    host: surcharge.host ?? configurationBaseDonnees.host,
    port: surcharge.port ?? configurationBaseDonnees.port,
    user: surcharge.user ?? configurationBaseDonnees.user,
    password: surcharge.password ?? configurationBaseDonnees.password,
    database: surcharge.database ?? configurationBaseDonnees.database,
    maxConnexions: surcharge.maxConnexions ?? 10,
    temporisationIdleMs: surcharge.temporisationIdleMs ?? 30_000,
    temporisationConnexionMs: surcharge.temporisationConnexionMs ?? 10_000,
    ssl: surcharge.ssl ?? false,
  };
}

// Cette fonction cree le pool PostgreSQL concret pour le BC Scolarite des Eleves.
export function creerPoolPostgresScolariteEleves(
  configuration: ConfigurationPoolPostgresScolariteEleves =
    creerConfigurationPoolPostgresScolariteEleves(),
): Pool {
  return new Pool({
    host: configuration.host,
    port: configuration.port,
    user: configuration.user,
    password: configuration.password,
    database: configuration.database,
    max: configuration.maxConnexions,
    idleTimeoutMillis: configuration.temporisationIdleMs,
    connectionTimeoutMillis: configuration.temporisationConnexionMs,
    ssl: configuration.ssl ? { rejectUnauthorized: false } : undefined,
    application_name: 'educsyn-scolarite-eleves',
  });
}
