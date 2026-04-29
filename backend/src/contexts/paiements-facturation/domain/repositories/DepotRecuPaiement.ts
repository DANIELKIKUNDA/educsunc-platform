import { RecuPaiement } from '../aggregates/RecuPaiement';

export interface DepotRecuPaiement {
  sauvegarder(recu: RecuPaiement): Promise<void>;
  listerParPaiement(idPaiement: string): Promise<RecuPaiement[]>;
}
