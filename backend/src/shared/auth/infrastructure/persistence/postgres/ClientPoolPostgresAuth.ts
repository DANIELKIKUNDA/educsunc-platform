import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, type PoolClient } from 'pg';

import { configurationBaseDonnees } from '../../../../../config/database.config';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import { creerConfigurationTlsPostgres } from '../../../../../shared/infrastructure/postgres/ConfigurationTlsPostgres';
import type {
  ResultatExecutionSql,
  SqlQueryClient,
} from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

export interface ConfigurationPoolPostgresAuth {
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

export function creerConfigurationPoolPostgresAuth(): ConfigurationPoolPostgresAuth {
  return {
    host: configurationBaseDonnees.host,
    port: configurationBaseDonnees.port,
    user: configurationBaseDonnees.user,
    password: configurationBaseDonnees.password,
    database: configurationBaseDonnees.database,
    maxConnexions: 10,
    temporisationIdleMs: 10_000,
    temporisationConnexionMs: 10_000,
    ssl: false,
  };
}

export function creerPoolPostgresAuth(
  configuration: ConfigurationPoolPostgresAuth = creerConfigurationPoolPostgresAuth(),
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
  });
}

export class ClientPoolPostgresAuth implements SqlQueryClient {
  private readonly transactionCourante = new AsyncLocalStorage<PoolClient>();

  constructor(private readonly pool: Pool) {}

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionSql<TLigne>> {
    try {
      const client = this.transactionCourante.getStore();
      const resultat = client
        ? await client.query(requeteSql, [...parametres])
        : await this.pool.query(requeteSql, [...parametres]);
      return {
        lignes: resultat.rows as readonly TLigne[],
        nombreLignesAffectees: resultat.rowCount ?? 0,
      };
    } catch (erreur) {
      if (process.env.EDUCSYN_AUTH_SQL_DEBUG === '1') {
        const cause = erreur as { code?: string; constraint?: string };
        console.error('[AUTH_POSTGRES]', {
          code: cause.code,
          contrainte: cause.constraint,
        });
      }
      throw new InfrastructureError(
        "L'execution d'une requete PostgreSQL Auth a echoue.",
        'CLIENT_POOL_POSTGRES_AUTH',
        { erreur },
      );
    }
  }

  public async dansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    if (this.transactionCourante.getStore()) {
      return operation();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const resultat = await this.transactionCourante.run(client, operation);
      await client.query('COMMIT');
      return resultat;
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  }
}

const poolAuthPartage = creerPoolPostgresAuth();
const clientAuthPartage = new ClientPoolPostgresAuth(poolAuthPartage);

export function obtenirPoolPostgresAuth(): Pool {
  return poolAuthPartage;
}

export function obtenirClientPostgresAuth(): ClientPoolPostgresAuth {
  return clientAuthPartage;
}
