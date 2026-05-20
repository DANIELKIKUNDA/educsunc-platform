import { ErreurClasseDejaTitulaire } from '../exceptions/ErreurClasseDejaTitulaire';

export class PolicyTitulariatClasse {
  public static verifier(classePossedeDejaTitulaire: boolean): void {
    if (classePossedeDejaTitulaire) {
      throw new ErreurClasseDejaTitulaire();
    }
  }
}
