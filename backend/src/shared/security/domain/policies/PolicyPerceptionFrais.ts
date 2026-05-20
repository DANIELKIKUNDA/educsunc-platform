import { ErreurRestrictionCaisse } from '../exceptions/ErreurRestrictionCaisse';

export class PolicyPerceptionFrais {
  public static verifier(autorise: boolean): void {
    if (!autorise) {
      throw new ErreurRestrictionCaisse();
    }
  }
}
