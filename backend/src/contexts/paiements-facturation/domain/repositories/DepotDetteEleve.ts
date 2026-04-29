import { DetteEleve } from '../aggregates/DetteEleve';

export interface DepotDetteEleve {
  sauvegarder(dette: DetteEleve): Promise<void>;
  trouverParEleve(idEcole: string, idEleve: string): Promise<DetteEleve | null>;
}
