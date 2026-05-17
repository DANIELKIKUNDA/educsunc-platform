import { ErreurClassementImpossible } from '../exceptions/ErreurClassementImpossible';

// Cette policy valide qu'une colonne peut etre classee.
export class PolicyClassementParColonne {
  // Cette methode interdit un classement sur une colonne non classable.
  public verifier(estClassable: boolean): void {
    if (!estClassable) {
      throw new ErreurClassementImpossible();
    }
  }
}
