import { Pool, type PoolConfig } from 'pg';

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
export class ClientPoolPostgresBulletinsEvaluations {
  // Cette methode construit un client de lecture simplifie a partir du pool.
  public static depuisPool(
    pool: Pool,
    fournisseurParametresSession?: FournisseurParametresSessionPostgresBulletinsEvaluations,
  ): ClientPoolPostgresBulletinsEvaluations {
    return new ClientPoolPostgresBulletinsEvaluations(pool, fournisseurParametresSession);
  }

  // Ce constructeur memorise le pool et le fournisseur de session.
  constructor(
    private readonly pool: Pool,
    private readonly fournisseurParametresSession?: FournisseurParametresSessionPostgresBulletinsEvaluations,
  ) {}

  // Cette methode execute une requete SQL simple et applique au prealable le contexte de session si besoin.
  public async requeter<TSortie = unknown>(
    texte: string,
    valeurs: readonly unknown[] = [],
  ): Promise<TSortie[]> {
    const client = await this.pool.connect();

    try {
      await this.appliquerParametresSession(client);
      const resultat = await client.query(texte, [...valeurs]);
      return resultat.rows as TSortie[];
    } finally {
      client.release();
    }
  }

  // Cette methode applique les parametres de session PostgreSQL au client courant.
  private async appliquerParametresSession(client: { query: (sql: string, valeurs?: readonly unknown[]) => Promise<unknown> }): Promise<void> {
    const parametres = this.fournisseurParametresSession?.obtenirParametresSession() ?? {};

    for (const [cle, valeur] of Object.entries(parametres)) {
      await client.query(`select set_config($1, $2, true)`, [cle, String(valeur ?? '')]);
    }
  }
}
