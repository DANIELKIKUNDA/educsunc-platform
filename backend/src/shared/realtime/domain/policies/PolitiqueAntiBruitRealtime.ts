import type { FiltreDiffusion } from '../entities';

export class PolitiqueAntiBruitRealtime {
  public autoriser(filtres: readonly FiltreDiffusion[]): boolean {
    return filtres.every((filtre) => filtre.autorise());
  }
}
