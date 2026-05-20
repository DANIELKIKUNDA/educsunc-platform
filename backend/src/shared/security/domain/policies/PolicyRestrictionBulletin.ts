import { RestrictionRole } from '../entities/RestrictionRole';
import { ErreurRestrictionBulletin } from '../exceptions/ErreurRestrictionBulletin';

export class PolicyRestrictionBulletin {
  public static verifier(restrictions: readonly RestrictionRole[]): void {
    if (restrictions.some((restriction) => restriction.obtenirCodeRestriction().obtenirValeur() === 'INTERDICTION_BULLETINS')) {
      throw new ErreurRestrictionBulletin();
    }
  }
}
