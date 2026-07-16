import { ContexteActifAuth, DepotContexteActifAuth } from '../../../../domain';
import { ContexteActifAuthPersistenceMapper } from '../mappers';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';

// Ce depot persiste les contextes actifs AUTH des utilisateurs.
export class PostgresContexteActifAuthRepository implements DepotContexteActifAuth {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(contexteActif: ContexteActifAuth): Promise<void> {
    const record = ContexteActifAuthPersistenceMapper.versRecord(contexteActif);
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
      [record.id_contexte_actif_auth, record.id_utilisateur, record.organisation_active_id,
        record.ecole_active_id, record.dernier_changement_le, record.version],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde du contexte Auth.');
    }
  }

  public async trouverContexteUtilisateur(idUtilisateur: string): Promise<ContexteActifAuth | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof ContexteActifAuthPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_contextes_actifs WHERE id_utilisateur = $1',
      [idUtilisateur],
    );
    const record = resultat.lignes[0];
    return record ? ContexteActifAuthPersistenceMapper.depuisRecord(record) : null;
  }
}
