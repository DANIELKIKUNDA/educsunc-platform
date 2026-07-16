import { ListerSessionsUtilisateurQuery, SessionUtilisateurReadModel } from '../../../../application';
import type { SqlQueryClient } from '../../../../../infrastructure/persistence/SqlQueryClient';
import { obtenirClientPostgresAuth } from '../ClientPoolPostgresAuth';

// Cette query liste les sessions connues pour un utilisateur AUTH.
export class ListerSessionsUtilisateurSQL implements ListerSessionsUtilisateurQuery {
  constructor(private readonly clientSql: SqlQueryClient = obtenirClientPostgresAuth()) {}

  public async executer(idUtilisateur: string): Promise<readonly SessionUtilisateurReadModel[]> {
    const resultat = await this.clientSql.executer<{
      id_session_utilisateur: string;
      id_utilisateur: string;
      organisation_active_id?: string;
      ecole_active_id?: string;
      est_offline: boolean;
    }>(
      `SELECT id_session_utilisateur, id_utilisateur, organisation_active_id,
              ecole_active_id, est_offline
       FROM auth_sessions_utilisateurs
       WHERE id_utilisateur = $1
       ORDER BY cree_le DESC`,
      [idUtilisateur],
    );
    return resultat.lignes.map((record) => ({
        sessionId: record.id_session_utilisateur,
        utilisateurId: record.id_utilisateur,
        organisationActiveId: record.organisation_active_id,
        ecoleActiveId: record.ecole_active_id,
        estOffline: record.est_offline,
      }));
  }
}
