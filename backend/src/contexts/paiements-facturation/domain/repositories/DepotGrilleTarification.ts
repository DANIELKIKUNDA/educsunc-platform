import { GrilleTarification } from '../aggregates/GrilleTarification';

export interface DepotGrilleTarification {
  sauvegarder(grille: GrilleTarification): Promise<void>;
  trouverParId(idGrilleTarification: string): Promise<GrilleTarification | null>;
  listerActivesParEcoleEtAnnee(idEcole: string, idAnneeScolaire: string): Promise<GrilleTarification[]>;
}
