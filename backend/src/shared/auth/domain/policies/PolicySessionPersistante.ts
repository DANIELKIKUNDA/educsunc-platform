import { ErreurSessionRevoquee } from '../exceptions/ErreurSessionRevoquee';

// Cette policy verifie qu'une session persistante reste encore exploitable.
export class PolicySessionPersistante {
  public static verifier(params: { revoqueeLe?: Date }): void {
    if (params.revoqueeLe) {
      throw new ErreurSessionRevoquee();
    }
  }
}
