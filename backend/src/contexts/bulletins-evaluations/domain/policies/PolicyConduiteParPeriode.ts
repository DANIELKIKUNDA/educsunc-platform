import { ErreurConduiteHorsBareme } from '../exceptions/ErreurConduiteHorsBareme';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';

// Cette policy relie la conduite aux periodes simples et au bareme officiel.
export class PolicyConduiteParPeriode {
  // Cette methode verifie qu'une conduite est bien encodable et dans son bareme.
  public verifier(codePeriode: CodePeriodeSimple, pointsConduite: number): void {
    if (!Object.values(CodePeriodeSimple).includes(codePeriode)) {
      throw new ErreurConduiteHorsBareme('La conduite ne peut etre encodee que sur une periode simple.');
    }

    if (!Number.isInteger(pointsConduite) || pointsConduite < 0 || pointsConduite > 100) {
      throw new ErreurConduiteHorsBareme();
    }
  }
}
