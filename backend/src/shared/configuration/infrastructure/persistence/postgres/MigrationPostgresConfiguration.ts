import type { PoolClient } from 'pg';

export interface MigrationPostgresConfiguration {
  version: number;
  nom: string;
  executer(client: PoolClient): Promise<void>;
}
