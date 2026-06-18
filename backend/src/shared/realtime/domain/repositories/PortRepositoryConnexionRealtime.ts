import type { ConnexionTempsReel } from '../aggregates';

export interface PortRepositoryConnexionRealtime {
  sauvegarder(connexion: ConnexionTempsReel): Promise<void>;
  trouverParId(id: string): Promise<ConnexionTempsReel | null>;
}
