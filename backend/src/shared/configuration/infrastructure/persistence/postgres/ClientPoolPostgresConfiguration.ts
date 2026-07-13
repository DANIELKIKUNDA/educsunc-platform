import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, type PoolClient } from 'pg';
import { configurationBaseDonnees } from '../../../../../config/database.config';
import { InfrastructureError } from '../../../../../shared/exceptions/InfrastructureError';
import type { ResultatExecutionSql, SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';
import type { PortUniteTravailConfiguration } from '../../../application/ports';

export interface ConfigurationPoolPostgresConfiguration {
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

export function creerConfigurationPoolPostgresConfiguration():
ConfigurationPoolPostgresConfiguration {
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

export function creerPoolPostgresConfiguration(
  configuration: ConfigurationPoolPostgresConfiguration = creerConfigurationPoolPostgresConfiguration(),
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
  });
}

export class ClientPoolPostgresConfiguration implements SqlQueryClient, PortUniteTravailConfiguration {
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
      throw new InfrastructureError(
        "L'execution d'une requete PostgreSQL Configuration a echoue.",
        'CLIENT_POOL_POSTGRES_CONFIGURATION',
        {
          requeteSql,
          parametres,
          erreur,
        },
      );
    }
  }

  public async dansTransaction<T>(operation: () => Promise<T>): Promise<T> {
    if (this.transactionCourante.getStore()) {
      return operation();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const resultat = await this.transactionCourante.run(client, operation);
      await client.query('COMMIT');
      return resultat;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

}
