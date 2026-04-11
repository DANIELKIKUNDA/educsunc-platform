import type { IdempotencyStore } from './IdempotencyStore';

// Placeholder du stockage PostgreSQL des cles d'idempotence du contexte scolarite eleves.
export class PostgresIdempotencyStore implements IdempotencyStore {
  async existe(_cle: string): Promise<boolean> {
    return false;
  }

  async enregistrer(_cle: string): Promise<void> {
    // Le branchement PostgreSQL sera ajoute ici.
  }
}
