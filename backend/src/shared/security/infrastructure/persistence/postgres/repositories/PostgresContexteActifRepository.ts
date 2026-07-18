import type { ContexteActifRepositoryPort } from '../../../../application';
import type { ContexteActifUtilisateur } from '../../../../domain';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../../../../../auth/infrastructure/persistence/postgres/ClientPoolPostgresAuth';
import { ContexteActifPersistenceMapper, type ContexteActifUtilisateurRecord } from '../mappers';

type AuthContextRow = {
  id_contexte_actif_auth: string;
  id_utilisateur: string;
  organisation_active_id?: string;
  ecole_active_id?: string;
  dernier_changement_le?: string;
  version: number;
};

export class PostgresContexteActifRepository implements ContexteActifRepositoryPort {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(contexte: ContexteActifUtilisateur): Promise<void> {
    const record = ContexteActifPersistenceMapper.versRecord(contexte);
    const resultat = await this.clientSql.executer(
      `INSERT INTO auth_contextes_actifs (
         id_contexte_actif_auth, id_utilisateur, organisation_active_id,
         ecole_active_id, dernier_changement_le, version
       ) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id_utilisateur) DO UPDATE SET
         organisation_active_id = EXCLUDED.organisation_active_id,
         ecole_active_id = EXCLUDED.ecole_active_id,
         dernier_changement_le = EXCLUDED.dernier_changement_le,
         version = EXCLUDED.version
       WHERE auth_contextes_actifs.version < EXCLUDED.version`,
      [record.id_contexte_actif_utilisateur, record.id_utilisateur,
        record.id_organisation_active ?? null, record.id_ecole_active ?? null,
        record.date_changement, record.version],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde du contexte actif.');
    }
  }

  public async trouverParUtilisateur(idUtilisateur: string): Promise<ContexteActifUtilisateur | null> {
    const resultat = await this.clientSql.executer<AuthContextRow>(
      'SELECT * FROM auth_contextes_actifs WHERE id_utilisateur = $1', [idUtilisateur],
    );
    const row = resultat.lignes[0];
    if (!row) return null;
    const record: ContexteActifUtilisateurRecord = {
      id_contexte_actif_utilisateur: row.id_contexte_actif_auth,
      id_utilisateur: row.id_utilisateur,
      id_organisation_active: row.organisation_active_id,
      id_ecole_active: row.ecole_active_id,
      date_changement: row.dernier_changement_le ?? new Date(0).toISOString(),
      version: row.version,
    };
    return ContexteActifPersistenceMapper.depuisRecord(record);
  }
}
