import type { EvenementTempsReel } from '../aggregates';
import { PolitiqueDiffusionRealtime } from '../policies';

export class ServiceEvaluationDiffusionRealtime {
  private readonly politique = new PolitiqueDiffusionRealtime();

  public evaluer(evenement: EvenementTempsReel): boolean {
    return this.politique.autoriser(evenement);
  }
}
