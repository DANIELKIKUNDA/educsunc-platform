import type { CanalTempsReel } from '../entities';

export class SpecificationCanalValide {
  public estSatisfaitePar(canal: CanalTempsReel): boolean {
    return canal.nom.trim().length > 0;
  }
}
