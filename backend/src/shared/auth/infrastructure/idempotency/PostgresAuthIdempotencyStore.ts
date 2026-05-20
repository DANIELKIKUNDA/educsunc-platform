import { PostgresIdempotencyStore } from '../../../infrastructure/idempotency/PostgresIdempotencyStore';
import { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { AuthIdempotencyStore } from './AuthIdempotencyStore';

// Cette implementation reutilise l'idempotence PostgreSQL partagee pour AUTH.
export class PostgresAuthIdempotencyStore extends PostgresIdempotencyStore implements AuthIdempotencyStore {
  constructor(clientSql: SqlQueryClient) {
    super(clientSql);
  }
}
