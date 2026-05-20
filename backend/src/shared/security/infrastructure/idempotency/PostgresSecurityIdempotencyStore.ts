import { PostgresIdempotencyStore } from 'shared/infrastructure/idempotency/PostgresIdempotencyStore';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';
import type { SecurityIdempotencyStore } from './SecurityIdempotencyStore';

// Cette implementation reutilise le moteur PostgreSQL partage pour l'idempotence SECURITY.
export class PostgresSecurityIdempotencyStore extends PostgresIdempotencyStore implements SecurityIdempotencyStore {
  constructor(clientSql: SqlQueryClient) {
    super(clientSql);
  }
}
