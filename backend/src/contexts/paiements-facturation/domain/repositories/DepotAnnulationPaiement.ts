import { AnnulationPaiement } from '../aggregates/AnnulationPaiement';

export interface DepotAnnulationPaiement {
  sauvegarder(annulationPaiement: AnnulationPaiement): Promise<void>;
  trouverParId(idAnnulation: string): Promise<AnnulationPaiement | null>;
  trouverParPaiement(idPaiement: string): Promise<AnnulationPaiement | null>;
}
