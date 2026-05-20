import { ErreurContexteActifInvalide } from '../exceptions/ErreurContexteActifInvalide';

export class PolicyContexteActif {
  public static verifier(scopeActifValide: boolean): void {
    if (!scopeActifValide) {
      throw new ErreurContexteActifInvalide();
    }
  }
}
