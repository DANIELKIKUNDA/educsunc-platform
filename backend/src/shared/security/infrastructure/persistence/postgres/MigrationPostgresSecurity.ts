import type { PoolClient } from 'pg';

export interface MigrationPostgresSecurity {
  readonly version: number;
  readonly nom: string;
  executer(client: PoolClient): Promise<void>;
}
