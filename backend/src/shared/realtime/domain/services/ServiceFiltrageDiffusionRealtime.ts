import type { FiltreDiffusion } from '../entities';
import { PolitiqueAntiBruitRealtime } from '../policies';

export class ServiceFiltrageDiffusionRealtime {
  private readonly politique = new PolitiqueAntiBruitRealtime();

  public autoriser(filtres: readonly FiltreDiffusion[]): boolean {
    return this.politique.autoriser(filtres);
  }
}
