import type { ResultatExecutionSql, SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';

// Ce fichier definit le client PostgreSQL minimal utilise par les depots du BC Scolarite des Eleves.
export interface ResultatExecutionPostgresScolarite<TLigne extends object = Record<string, unknown>>
  extends ResultatExecutionSql<TLigne> {}

/**
 * Ce contrat evite de coupler les depots a une librairie PostgreSQL concrete.
 */
export interface ClientPostgresScolariteEleves extends SqlQueryClient {}
