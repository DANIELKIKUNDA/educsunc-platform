import { SessionOutput } from '../../dto/output';

// Ce port encapsule le cache technique des sessions et du mode offline.
export interface SessionCachePort {
  memoriserSession(session: SessionOutput): Promise<void>;
  obtenirSession(idSessionUtilisateur: string): Promise<SessionOutput | null>;
  invaliderSession(idSessionUtilisateur: string): Promise<void>;
  memoriserAuthOffline(utilisateurId: string, payload: Record<string, unknown>): Promise<void>;
  obtenirAuthOffline(utilisateurId: string): Promise<Record<string, unknown> | null>;
}
