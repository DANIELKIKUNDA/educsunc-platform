import { CoteEntiereNaturelle } from '../value-objects/CoteEntiereNaturelle';

// Cette policy force toute cote encodee a rester entiere et naturelle.
export class PolicyCoteEntiereNaturelle {
  // Cette methode verifie qu'une cote eventuelle respecte la forme attendue.
  public verifier(valeur?: number | null): void {
    if (valeur === undefined || valeur === null) {
      return;
    }

    new CoteEntiereNaturelle(valeur);
  }
}
