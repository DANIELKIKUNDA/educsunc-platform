import type { EvenementTempsReel } from '../aggregates';

export interface PortRepositoryEvenementRealtime {
  sauvegarder(evenement: EvenementTempsReel): Promise<void>;
  listerDiffusables(): Promise<readonly EvenementTempsReel[]>;
}
