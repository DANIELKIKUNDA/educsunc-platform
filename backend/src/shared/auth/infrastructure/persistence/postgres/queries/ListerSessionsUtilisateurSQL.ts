import { ListerSessionsUtilisateurQuery, SessionUtilisateurReadModel } from '../../../../application';
import { PostgresSessionUtilisateurRepository } from '../repositories/PostgresSessionUtilisateurRepository';
import { obtenirMemoireAuthStore } from '../repositories/_memoireAuthStore';

// Cette query liste les sessions connues pour un utilisateur AUTH.
export class ListerSessionsUtilisateurSQL implements ListerSessionsUtilisateurQuery {
  constructor(private readonly repository: PostgresSessionUtilisateurRepository) {
    void this.repository;
  }

  public async executer(idUtilisateur: string): Promise<readonly SessionUtilisateurReadModel[]> {
    const store = obtenirMemoireAuthStore();
    return Array.from(store.sessions.values())
      .filter((record) => record.id_utilisateur === idUtilisateur)
      .map((record) => ({
        sessionId: record.id_session_utilisateur,
        utilisateurId: record.id_utilisateur,
        organisationActiveId: record.organisation_active_id,
        ecoleActiveId: record.ecole_active_id,
        estOffline: record.est_offline,
      }));
  }
}
