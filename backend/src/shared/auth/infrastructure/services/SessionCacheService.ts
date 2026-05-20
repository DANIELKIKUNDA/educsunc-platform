import type { SessionCachePort } from '../../application/ports/cache/SessionCachePort';
import type { SessionOutput } from '../../application/dto/output/SessionOutput';

// Ce service fournit un cache memoire simple pour les sessions et l'offline AUTH.
export class SessionCacheService implements SessionCachePort {
  private readonly sessions = new Map<string, SessionOutput>();
  private readonly authOffline = new Map<string, Record<string, unknown>>();

  public async memoriserSession(session: SessionOutput): Promise<void> {
    this.sessions.set(session.sessionId, { ...session });
  }

  public async obtenirSession(idSessionUtilisateur: string): Promise<SessionOutput | null> {
    return this.sessions.get(idSessionUtilisateur) ?? null;
  }

  public async invaliderSession(idSessionUtilisateur: string): Promise<void> {
    this.sessions.delete(idSessionUtilisateur);
  }

  public async memoriserAuthOffline(utilisateurId: string, payload: Record<string, unknown>): Promise<void> {
    this.authOffline.set(utilisateurId, { ...payload });
  }

  public async obtenirAuthOffline(utilisateurId: string): Promise<Record<string, unknown> | null> {
    return this.authOffline.get(utilisateurId) ?? null;
  }
}
