import { AsyncLocalStorage } from 'node:async_hooks';
import type { PoolClient } from 'pg';

// Ce contexte partage le client SQL de l'unite de travail avec tous les depots et l'outbox Audit.
export class BulletinTransactionContext {
  private readonly storage = new AsyncLocalStorage<PoolClient>();

  public executer<T>(client: PoolClient, operation: () => Promise<T>): Promise<T> {
    return this.storage.run(client, operation);
  }

  public obtenirClient(): PoolClient | undefined {
    return this.storage.getStore();
  }
}
