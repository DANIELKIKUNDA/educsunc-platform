import { Paiement } from '../aggregates/Paiement';

export interface DepotPaiement {
  sauvegarder(paiement: Paiement): Promise<void>;
  trouverParId(idPaiement: string): Promise<Paiement | null>;
  trouverParIdempotencyKey(idEcole: string, idempotencyKey: string): Promise<Paiement | null>;
}
