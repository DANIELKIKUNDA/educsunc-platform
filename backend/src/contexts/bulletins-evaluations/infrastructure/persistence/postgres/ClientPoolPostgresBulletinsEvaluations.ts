import { Pool, type PoolConfig } from 'pg';
import type { ResultatExecutionSql, SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';
import { BulletinTransactionContext } from './transaction/BulletinTransactionContext';

// Ce fichier construit le pool PostgreSQL technique du BC Bulletins & Evaluations.
export interface ConfigurationPoolPostgresBulletinsEvaluations extends PoolConfig {}

// Ce type abstrait un fournisseur de parametres de session SQL pour le multi-tenant.
export interface FournisseurParametresSessionPostgresBulletinsEvaluations {
  obtenirParametresSession(): Record<string, string | boolean | null | undefined>;
}

// Cette fonction cree la configuration par defaut du pool PostgreSQL du BC.
export function creerConfigurationPoolPostgresBulletinsEvaluations(): ConfigurationPoolPostgresBulletinsEvaluations {
  return {
    connectionString: process.env.DATABASE_URL,
  };
}

// Cette fonction instancie un pool PostgreSQL partage pour le BC.
export function creerPoolPostgresBulletinsEvaluations(
  configuration: ConfigurationPoolPostgresBulletinsEvaluations = creerConfigurationPoolPostgresBulletinsEvaluations(),
): Pool {
  return new Pool(configuration);
}

// Ce client de lecture applique au besoin le contexte de session avant une requete.
export class ClientPoolPostgresBulletinsEvaluations implements SqlQueryClient {
  // Cette methode construit un client de lecture simplifie a partir du pool.
  public static depuisPool(
    pool: Pool,
    fournisseurParametresSession?: FournisseurParametresSessionPostgresBulletinsEvaluations,
    contexteTransaction?: BulletinTransactionContext,
  ): ClientPoolPostgresBulletinsEvaluations {
    return new ClientPoolPostgresBulletinsEvaluations(pool, fournisseurParametresSession, contexteTransaction);
  }

  // Ce constructeur memorise le pool et le fournisseur de session.
  constructor(
    private readonly pool: Pool,
    private readonly fournisseurParametresSession?: FournisseurParametresSessionPostgresBulletinsEvaluations,
    private readonly contexteTransaction = new BulletinTransactionContext(),
  ) {}

  public async executer<TLigne extends object = Record<string, unknown>>(
    texte: string,
    valeurs: readonly unknown[] = [],
  ): Promise<ResultatExecutionSql<TLigne>> {
    const clientTransactionnel = this.contexteTransaction.obtenirClient();
    if (clientTransactionnel) {
      const resultat = await clientTransactionnel.query(texte, [...valeurs]);
      return {
        lignes: resultat.rows as readonly TLigne[],
        nombreLignesAffectees: resultat.rowCount ?? 0,
      };
    }
    const client = await this.pool.connect();
    try {
      await this.appliquerParametresSession(client);
      const resultat = await client.query(texte, [...valeurs]);
      return {
        lignes: resultat.rows as readonly TLigne[],
        nombreLignesAffectees: resultat.rowCount ?? 0,
      };
    } finally {
      client.release();
    }
  }

  // Cette methode execute une requete SQL simple et applique au prealable le contexte de session si besoin.
  public async requeter<TSortie = unknown>(
    texte: string,
    valeurs: readonly unknown[] = [],
  ): Promise<TSortie[]> {
    const resultat = await this.executer<TSortie & object>(texte, valeurs);
    return resultat.lignes as TSortie[];
  }

  // Cette methode applique les parametres de session PostgreSQL au client courant.
  private async appliquerParametresSession(client: { query: (sql: string, valeurs?: readonly unknown[]) => Promise<unknown> }): Promise<void> {
    const parametres = this.fournisseurParametresSession?.obtenirParametresSession() ?? {};

    for (const [cle, valeur] of Object.entries(parametres)) {
      await client.query(`select set_config($1, $2, true)`, [cle, String(valeur ?? '')]);
    }
  }
}
