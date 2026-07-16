import type { PoolClient } from 'pg';

export interface MigrationPostgresAuth {
  readonly version: number;
  readonly nom: string;
  executer(client: PoolClient): Promise<void>;
}
