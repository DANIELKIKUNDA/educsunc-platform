import { TentativeConnexion } from '../aggregates/TentativeConnexion';

// Ce depot definit le contrat de persistance des tentatives de connexion.
export interface DepotTentativeConnexion {
  sauvegarder(tentativeConnexion: TentativeConnexion): Promise<void>;
  listerTentativesUtilisateur(idUtilisateur: string): Promise<readonly TentativeConnexion[]>;
}
