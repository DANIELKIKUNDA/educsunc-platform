import { RestrictionRole } from '../entities/RestrictionRole';
import { ErreurRestrictionCaisse } from '../exceptions/ErreurRestrictionCaisse';

export class PolicyRestrictionCaisse {
  public static verifier(restrictions: readonly RestrictionRole[]): void {
    if (restrictions.some((restriction) => restriction.obtenirCodeRestriction().obtenirValeur() === 'INTERDICTION_CAISSE')) {
      throw new ErreurRestrictionCaisse();
    }
  }
}
