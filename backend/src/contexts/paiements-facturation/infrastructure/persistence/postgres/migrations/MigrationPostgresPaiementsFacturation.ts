import type { PoolClient } from 'pg';

// Ce contrat represente une migration PostgreSQL du BC Paiements & Facturation.
export interface MigrationPostgresPaiementsFacturation {
  version: number;
  nom: string;
  executer(client: PoolClient): Promise<void>;
}
