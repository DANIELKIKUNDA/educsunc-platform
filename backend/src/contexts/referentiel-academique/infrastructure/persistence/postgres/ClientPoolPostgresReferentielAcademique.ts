import { Pool, type PoolClient } from 'pg';
import { configurationBaseDonnees } from '../../../../../config/database.config';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import { creerConfigurationTlsPostgres } from '../../../../../shared/infrastructure/postgres/ConfigurationTlsPostgres';
import type { ClientPostgresReferentielAcademique, ResultatExecutionPostgres } from './depots/ClientPostgresReferentielAcademique';

// Cette interface represente les parametres de session PostgreSQL utiles au tenant courant.
export interface ParametresSessionPostgresReferentielAcademique {
  tenantId: string | null;
  organisationId: string | null;
  lectureOrganisationnelle: boolean;
}

// Ce fournisseur expose les parametres de session a injecter avant une requete.
export interface FournisseurParametresSessionPostgresReferentielAcademique {
  obtenirParametresSession(): ParametresSessionPostgresReferentielAcademique;
}

// Cette interface represente la configuration technique minimale du pool PostgreSQL.
export interface ConfigurationPoolPostgresReferentielAcademique {
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

// Cette classe fournit un client PostgreSQL concret compatible avec les depots du BC.
export class ClientPoolPostgresReferentielAcademique
  implements ClientPostgresReferentielAcademique
{
  private readonly executantRequetes: Pool | PoolClient;
  private readonly estTransactionnel: boolean;
  private readonly liberateur?: () => void;
  private readonly fournisseurParametresSession?:
    FournisseurParametresSessionPostgresReferentielAcademique;

  // Ce constructeur initialise un client concret a partir d'un pool ou d'un client transactionnel.
  constructor(
    executantRequetes: Pool | PoolClient,
    estTransactionnel = false,
    liberateur?: () => void,
    fournisseurParametresSession?:
      FournisseurParametresSessionPostgresReferentielAcademique,
  ) {
    this.executantRequetes = executantRequetes;
    this.estTransactionnel = estTransactionnel;
    this.liberateur = liberateur;
    this.fournisseurParametresSession = fournisseurParametresSession;
  }

  // Cette methode construit un client de lecture base sur un pool partage.
  public static depuisPool(
    pool: Pool,
    fournisseurParametresSession?:
      FournisseurParametresSessionPostgresReferentielAcademique,
  ): ClientPoolPostgresReferentielAcademique {
    return new ClientPoolPostgresReferentielAcademique(
      pool,
      false,
      undefined,
      fournisseurParametresSession,
    );
  }

  // Cette methode construit un client transactionnel base sur un client dedie.
  public static depuisClientTransactionnel(
    clientTransactionnel: PoolClient,
    fournisseurParametresSession?:
      FournisseurParametresSessionPostgresReferentielAcademique,
  ): ClientPoolPostgresReferentielAcademique {
    return new ClientPoolPostgresReferentielAcademique(
      clientTransactionnel,
      true,
      () => clientTransactionnel.release(),
      fournisseurParametresSession,
    );
  }

  // Cette methode execute une requete SQL en normalisant le resultat pour le BC.
  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionPostgres<TLigne>> {
    const parametresSession = this.fournisseurParametresSession?.obtenirParametresSession();

    try {
      if (this.estTransactionnel) {
        const clientTransactionnel = this.executantRequetes as PoolClient;

        await this.appliquerParametresSession(clientTransactionnel, parametresSession);

        const resultat = await clientTransactionnel.query(
          requeteSql,
          [...parametres],
        );

        return {
          lignes: resultat.rows as readonly TLigne[],
          nombreLignesAffectees: resultat.rowCount ?? 0,
        };
      }

      if (parametresSession !== undefined) {
        const clientDedie = await (this.executantRequetes as Pool).connect();

        try {
          await this.appliquerParametresSession(clientDedie, parametresSession);

          const resultat = await clientDedie.query(
            requeteSql,
            [...parametres],
          );

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
        "L'execution d'une requete PostgreSQL a echoue.",
        'EXECUTION_REQUETE_POSTGRES',
        requeteSql,
        parametres,
        erreur,
      );
    }
  }

  // Cette methode ouvre une transaction SQL explicite sur un client dedie.
  public async commencerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('BEGIN', 'OUVERTURE_TRANSACTION_POSTGRES');
  }

  // Cette methode valide une transaction SQL ouverte.
  public async validerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('COMMIT', 'VALIDATION_TRANSACTION_POSTGRES');
  }

  // Cette methode annule une transaction SQL ouverte.
  public async annulerTransaction(): Promise<void> {
    await this.executerCommandeTransactionnelle('ROLLBACK', 'ANNULATION_TRANSACTION_POSTGRES');
  }

  // Cette methode libere la ressource dediee si le client est transactionnel.
  public async liberer(): Promise<void> {
    if (this.liberateur === undefined) {
      return;
    }

    try {
      this.liberateur();
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La liberation du client PostgreSQL a echoue.',
        'LIBERATION_CLIENT_POSTGRES',
        undefined,
        [],
        erreur,
      );
    }
  }

  // Cette methode ferme le pool de connexions lorsqu'il est possede par cette instance.
  public async fermerPool(): Promise<void> {
    if (this.estTransactionnel) {
      throw this.creerErreurInfrastructure(
        'Seul un client base sur un pool partage peut fermer le pool.',
        'FERMETURE_POOL_POSTGRES_INTERDITE',
      );
    }

    try {
      await (this.executantRequetes as Pool).end();
    } catch (erreur) {
      throw this.creerErreurInfrastructure(
        'La fermeture du pool PostgreSQL a echoue.',
        'FERMETURE_POOL_POSTGRES',
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

  // Cette methode aligne les variables de session PostgreSQL sur le contexte tenant courant.
  private async appliquerParametresSession(
    client: PoolClient,
    parametresSession?: ParametresSessionPostgresReferentielAcademique,
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
    return new InfrastructureError(
      message,
      'CLIENT_POOL_POSTGRES_REFERENTIEL_ACADEMIQUE',
      {
        etape,
        requeteSql,
        parametres,
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

// Cette fonction construit une configuration de pool a partir de la configuration backend existante.
export function creerConfigurationPoolPostgresReferentielAcademique(
  surcharge: Partial<ConfigurationPoolPostgresReferentielAcademique> = {},
): ConfigurationPoolPostgresReferentielAcademique {
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

// Cette fonction cree un pool PostgreSQL concret pour le BC Referentiel Academique.
export function creerPoolPostgresReferentielAcademique(
  configuration: ConfigurationPoolPostgresReferentielAcademique = creerConfigurationPoolPostgresReferentielAcademique(),
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
    ssl: creerConfigurationTlsPostgres(configuration.ssl),
    application_name: 'educsyn-referentiel-academique',
  });
}
