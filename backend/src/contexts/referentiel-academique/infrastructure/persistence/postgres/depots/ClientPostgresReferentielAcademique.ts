import type { ResultatExecutionSql, SqlQueryClient } from '../../../../../../shared/infrastructure/persistence/SqlQueryClient';

// Cette interface represente le resultat normalise d'une requete PostgreSQL.
export interface ResultatExecutionPostgres<TLigne extends object = Record<string, unknown>>
  extends ResultatExecutionSql<TLigne> {}

// Ce contrat abstrait un client PostgreSQL utilisable par les depots du BC.
export interface ClientPostgresReferentielAcademique extends SqlQueryClient {}
