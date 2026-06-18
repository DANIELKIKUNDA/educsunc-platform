import { RecuPaiement } from '../aggregates/RecuPaiement';

export interface DepotRecuPaiement {
  sauvegarder(recu: RecuPaiement): Promise<void>;
  trouverParId(idRecu: string): Promise<RecuPaiement | null>;
  listerParPaiement(idPaiement: string): Promise<RecuPaiement[]>;
}
