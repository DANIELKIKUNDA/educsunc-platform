import { Restitution } from '../aggregates/Restitution';

export interface DepotRestitution {
  sauvegarder(restitution: Restitution): Promise<void>;
  trouverParId(idRestitution: string): Promise<Restitution | null>;
  trouverParPaiement(idPaiement: string): Promise<Restitution | null>;
}
