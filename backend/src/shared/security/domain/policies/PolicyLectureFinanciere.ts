import { ErreurRestrictionFinanciere } from '../exceptions/ErreurRestrictionFinanciere';

export class PolicyLectureFinanciere {
  public static verifier(autorise: boolean): void {
    if (!autorise) {
      throw new ErreurRestrictionFinanciere();
    }
  }
}
