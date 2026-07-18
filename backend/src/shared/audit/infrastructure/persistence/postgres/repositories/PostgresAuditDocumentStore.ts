import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';

const CHAMPS_SENSIBLES = /password|mot.?de.?passe|token|jwt|cookie|secret|hash|authorization/i;

function assainir(valeur: unknown): unknown {
  if (Array.isArray(valeur)) return valeur.map(assainir);
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur as Record<string, unknown>)
      .filter(([cle]) => !CHAMPS_SENSIBLES.test(cle))
      .map(([cle, contenu]) => [cle, assainir(contenu)]));
  }
  return valeur;
}

function restaurerDates(valeur: unknown, cle = ''): unknown {
  if (Array.isArray(valeur)) return valeur.map((element) => restaurerDates(element));
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur as Record<string, unknown>)
      .map(([nom, contenu]) => [nom, restaurerDates(contenu, nom)]));
  }
  if (typeof valeur === 'string' && /^(date|.*At$|.*Le$)/i.test(cle) && /^\d{4}-\d{2}-\d{2}T/.test(valeur)) {
    return new Date(valeur);
  }
  return valeur;
}

type DocumentRow = { document_key: string; payload: unknown };

export class PostgresAuditDocumentStore {
  public constructor(private readonly client: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async enregistrer<T>(type: string, cle: string, valeur: T): Promise<void> {
    await this.client.executer(
      `INSERT INTO audit_runtime_documents(document_type,document_key,payload)
       VALUES ($1,$2,$3::jsonb)
       ON CONFLICT (document_type,document_key)
       DO UPDATE SET payload=EXCLUDED.payload, modifie_le=NOW()`,
      [type, cle, JSON.stringify(assainir(valeur))],
    );
  }

  public async obtenir<T>(type: string, cle: string): Promise<T | null> {
    const resultat = await this.client.executer<DocumentRow>(
      'SELECT document_key,payload FROM audit_runtime_documents WHERE document_type=$1 AND document_key=$2',
      [type, cle],
    );
    return resultat.lignes[0] ? restaurerDates(resultat.lignes[0].payload) as T : null;
  }

  public async lister<T>(type: string): Promise<T[]> {
    const resultat = await this.client.executer<DocumentRow>(
      'SELECT document_key,payload FROM audit_runtime_documents WHERE document_type=$1 ORDER BY modifie_le DESC',
      [type],
    );
    return resultat.lignes.map((ligne) => restaurerDates(ligne.payload) as T);
  }

  public async supprimer(type: string, cle: string): Promise<boolean> {
    const resultat = await this.client.executer(
      'DELETE FROM audit_runtime_documents WHERE document_type=$1 AND document_key=$2',
      [type, cle],
    );
    return resultat.nombreLignesAffectees > 0;
  }

  public async compter(type: string): Promise<number> {
    const resultat = await this.client.executer<{ total: string }>(
      'SELECT COUNT(*)::text AS total FROM audit_runtime_documents WHERE document_type=$1', [type],
    );
    return Number(resultat.lignes[0]?.total ?? 0);
  }
}
