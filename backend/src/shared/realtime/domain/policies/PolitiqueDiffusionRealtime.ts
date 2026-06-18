import type { EvenementTempsReel } from '../aggregates';

export class PolitiqueDiffusionRealtime {
  public autoriser(evenement: EvenementTempsReel): boolean {
    return evenement.peutEtreDiffuse();
  }
}
