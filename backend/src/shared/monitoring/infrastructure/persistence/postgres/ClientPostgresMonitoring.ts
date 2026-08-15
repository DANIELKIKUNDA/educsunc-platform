import { Pool, type PoolConfig } from 'pg';
import { configurationBaseDonnees } from '../../../../../config/database.config';
import { creerConfigurationTlsPostgres } from '../../../../infrastructure/postgres/ConfigurationTlsPostgres';

export function creerPoolPostgresMonitoring(overrides: PoolConfig = {}): Pool {
  return new Pool({
    host: configurationBaseDonnees.host,
    port: configurationBaseDonnees.port,
    user: configurationBaseDonnees.user,
    password: configurationBaseDonnees.password,
    database: configurationBaseDonnees.database,
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 3_000,
    ssl: creerConfigurationTlsPostgres(false),
    ...overrides,
  });
}
