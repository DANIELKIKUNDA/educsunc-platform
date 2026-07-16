import { DepotSessionUtilisateur, SessionUtilisateur } from '../../../../domain';
import { SessionPersistenceMapper } from '../mappers';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';

// Ce depot persiste les sessions utilisateurs AUTH.
export class PostgresSessionUtilisateurRepository implements DepotSessionUtilisateur {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async sauvegarder(session: SessionUtilisateur): Promise<void> {
    const record = SessionPersistenceMapper.versRecord(session);
    const resultat = await this.clientSql.executer(
      `INSERT INTO auth_sessions_utilisateurs (
         id_session_utilisateur, id_utilisateur, refresh_token_id, adresse_ip,
         user_agent, device_id, est_offline, revoquee_le,
         raison_revocation, dernier_refresh_le, organisation_active_id,
         ecole_active_id, cree_le, version
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id_session_utilisateur) DO UPDATE SET
         refresh_token_id = EXCLUDED.refresh_token_id,
         est_offline = EXCLUDED.est_offline,
         revoquee_le = EXCLUDED.revoquee_le,
         raison_revocation = EXCLUDED.raison_revocation,
         dernier_refresh_le = EXCLUDED.dernier_refresh_le,
         organisation_active_id = EXCLUDED.organisation_active_id,
         ecole_active_id = EXCLUDED.ecole_active_id,
         version = EXCLUDED.version
       WHERE auth_sessions_utilisateurs.version < EXCLUDED.version`,
      [record.id_session_utilisateur, record.id_utilisateur, record.refresh_token_id,
        record.adresse_ip, record.user_agent, record.device_id, record.est_offline,
        record.revoquee_le, record.raison_revocation,
        record.dernier_refresh_le, record.organisation_active_id, record.ecole_active_id,
        record.cree_le, record.version],
    );
    if (resultat.nombreLignesAffectees === 0) {
      throw new Error('Conflit de version lors de la sauvegarde de la session Auth.');
    }
  }

  public async trouverSessionActive(idSessionUtilisateur: string): Promise<SessionUtilisateur | null> {
    const session = await this.trouverParId(idSessionUtilisateur);
    if (!session) {
      return null;
    }
    try {
      session.verifierValidite();
      return session;
    } catch {
      return null;
    }
  }

  public async trouverParId(idSessionUtilisateur: string): Promise<SessionUtilisateur | null> {
    const resultat = await this.clientSql.executer<ReturnType<typeof SessionPersistenceMapper.versRecord>>(
      'SELECT * FROM auth_sessions_utilisateurs WHERE id_session_utilisateur = $1',
      [idSessionUtilisateur],
    );
    const record = resultat.lignes[0];
    if (!record) {
      return null;
    }

    return SessionPersistenceMapper.depuisRecord(record);
  }

  public async revoquerSessionsUtilisateur(idUtilisateur: string, raisonRevocation = 'revocation-globale'): Promise<void> {
    await this.clientSql.executer(
      `UPDATE auth_sessions_utilisateurs
       SET revoquee_le = COALESCE(revoquee_le, NOW()),
           raison_revocation = COALESCE(raison_revocation, $2),
           version = CASE WHEN revoquee_le IS NULL THEN version + 1 ELSE version END
       WHERE id_utilisateur = $1 AND revoquee_le IS NULL`,
      [idUtilisateur, raisonRevocation],
    );
  }
}
