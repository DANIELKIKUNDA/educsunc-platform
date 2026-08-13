import type { SqlQueryClient } from '../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import type { AuditCategoryRow, AuditEntryRow } from '../../persistence/postgres/mappers/AuditPersistenceRecords';
import { calculerChecksumAudit } from './CanonicalAuditSerializer';

export interface AuditIntegrityVerification {
  readonly idAuditEntry: string;
  readonly statut: 'VALID' | 'CORRUPTED' | 'MISSING' | 'UNKNOWN';
  readonly checksumAttendu?: string;
  readonly checksumObserve?: string;
}

type SealRow = { checksum: string };
type EntryWithCategories = AuditEntryRow & { categories: string[] | null };

export class PostgresAuditIntegrityStore {
  public constructor(private readonly client: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sceller(row: AuditEntryRow, categories: readonly AuditCategoryRow[]): Promise<string> {
    const checksum = this.calculer(row, categories.map((categorie) => categorie.categorie));
    await this.client.executer(
      `INSERT INTO audit_integrity_seals(
         audit_entry_id,canonical_version,hash_algorithm,checksum
       ) VALUES ($1,1,'SHA-256',$2)
       ON CONFLICT (audit_entry_id) DO NOTHING`,
      [row.id_audit_entry, checksum],
    );
    return checksum;
  }

  public async verifier(idAuditEntry: string): Promise<AuditIntegrityVerification> {
    const resultat = await this.client.executer<EntryWithCategories>(
      `SELECT e.*,
         ARRAY(SELECT c.categorie FROM audit_categories c
               WHERE c.audit_entry_id=e.id_audit_entry ORDER BY c.categorie) AS categories
       FROM audit_entries e WHERE e.id_audit_entry=$1`,
      [idAuditEntry],
    );
    const entree = resultat.lignes[0];
    if (!entree) return { idAuditEntry, statut: 'MISSING' };
    const sceau = await this.client.executer<SealRow>(
      'SELECT checksum FROM audit_integrity_seals WHERE audit_entry_id=$1',
      [idAuditEntry],
    );
    const checksumAttendu = sceau.lignes[0]?.checksum;
    if (!checksumAttendu) return { idAuditEntry, statut: 'UNKNOWN' };
    const checksumObserve = this.calculer(entree, entree.categories ?? []);
    return {
      idAuditEntry,
      statut: checksumObserve === checksumAttendu ? 'VALID' : 'CORRUPTED',
      checksumAttendu,
      checksumObserve,
    };
  }

  private calculer(row: AuditEntryRow, categories: readonly string[]): string {
    const { categories: _categories, ...entree } = row as EntryWithCategories;
    return calculerChecksumAudit({ ...entree, categories: [...categories].sort() });
  }
}
