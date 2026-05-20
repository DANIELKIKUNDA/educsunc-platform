import { ErreurEcoleActiveInvalide } from '../exceptions/ErreurEcoleActiveInvalide';

// Cette policy verifie qu'un utilisateur peut selectionner une ecole donnee.
export class PolicyMultiEcole {
  public static verifier(accesEcoles: readonly string[], ecoleActiveId?: string): void {
    if (!ecoleActiveId) {
      return;
    }

    if (!accesEcoles.includes(ecoleActiveId)) {
      throw new ErreurEcoleActiveInvalide();
    }
  }
}
