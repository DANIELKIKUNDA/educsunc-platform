import type { ValeurUtilisateur } from '../entities';

export class SpecificationValeurUtilisateurRealtime {
  public estSatisfaitePar(valeur: ValeurUtilisateur): boolean {
    return valeur.autoriseDiffusion();
  }
}
