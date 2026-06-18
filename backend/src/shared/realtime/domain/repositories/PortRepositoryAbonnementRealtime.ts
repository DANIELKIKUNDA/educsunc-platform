import type { AbonnementTempsReel } from '../aggregates';

export interface PortRepositoryAbonnementRealtime {
  sauvegarder(abonnement: AbonnementTempsReel): Promise<void>;
  trouverParConnexion(connexionId: string): Promise<readonly AbonnementTempsReel[]>;
}
