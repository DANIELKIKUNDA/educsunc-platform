import type { Pool, PoolClient } from 'pg';
import type { FournisseurParametresSessionPostgresBulletinsEvaluations } from '../ClientPoolPostgresBulletinsEvaluations';
import { BulletinTransactionContext } from './BulletinTransactionContext';

// Ce fichier definit et implemente le gestionnaire transactionnel PostgreSQL du BC Bulletins.
export interface TransactionManager {
  executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}

// Cette classe ouvre une transaction SQL, applique le contexte tenant puis commit ou rollback.
export class BulletinTransactionManager implements TransactionManager {
  // Ce constructeur injecte le pool et le fournisseur de session multi-tenant.
  constructor(
    private readonly pool: Pool,
    private readonly fournisseurParametresSession?: FournisseurParametresSessionPostgresBulletinsEvaluations,
    private readonly contexteTransaction = new BulletinTransactionContext(),
  ) {}

  // Cette methode encadre l'operation dans une transaction atomique classique.
  public async executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await this.appliquerParametresSession(client);
      const resultat = await this.contexteTransaction.executer(client, operation);
      await client.query('COMMIT');
      return resultat;
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  }

  // Cette methode applique les variables de session utiles aux futures policies RLS.
  private async appliquerParametresSession(client: PoolClient): Promise<void> {
    const parametres = this.fournisseurParametresSession?.obtenirParametresSession() ?? {};

    for (const [cle, valeur] of Object.entries(parametres)) {
      await client.query('select set_config($1, $2, true)', [cle, String(valeur ?? '')]);
    }
  }
}
