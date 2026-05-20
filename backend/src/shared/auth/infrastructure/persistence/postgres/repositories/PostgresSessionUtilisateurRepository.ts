import { DepotSessionUtilisateur, SessionUtilisateur } from '../../../../domain';
import { SessionPersistenceMapper } from '../mappers';
import { obtenirMemoireAuthStore } from './_memoireAuthStore';

// Ce depot persiste les sessions utilisateurs AUTH.
export class PostgresSessionUtilisateurRepository implements DepotSessionUtilisateur {
  private readonly store = obtenirMemoireAuthStore();

  public async sauvegarder(session: SessionUtilisateur): Promise<void> {
    const record = SessionPersistenceMapper.versRecord(session);
    this.store.sessions.set(record.id_session_utilisateur, record);
  }

  public async trouverSessionActive(idSessionUtilisateur: string): Promise<SessionUtilisateur | null> {
    const record = this.store.sessions.get(idSessionUtilisateur);
    if (!record) {
      return null;
    }

    const session = SessionPersistenceMapper.depuisRecord(record);
    try {
      session.verifierValidite();
      return session;
    } catch {
      return null;
    }
  }

  public async revoquerSessionsUtilisateur(idUtilisateur: string, raisonRevocation = 'revocation-globale'): Promise<void> {
    for (const [idSessionUtilisateur, record] of this.store.sessions.entries()) {
      if (record.id_utilisateur !== idUtilisateur) {
        continue;
      }

      const session = SessionPersistenceMapper.depuisRecord(record);
      session.revoquer(raisonRevocation);
      this.store.sessions.set(idSessionUtilisateur, SessionPersistenceMapper.versRecord(session));
    }
  }
}
