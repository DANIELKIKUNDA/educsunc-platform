import { ErreurSessionExpiree } from '../exceptions/ErreurSessionExpiree';
import { ErreurSessionRevoquee } from '../exceptions/ErreurSessionRevoquee';

// Cette policy verifie qu'une session persistante reste encore exploitable.
export class PolicySessionPersistante {
  public static verifier(params: { revoqueeLe?: Date; expireLe?: Date }, maintenant = new Date()): void {
    if (params.revoqueeLe) {
      throw new ErreurSessionRevoquee();
    }

    if (params.expireLe && params.expireLe.getTime() <= maintenant.getTime()) {
      throw new ErreurSessionExpiree();
    }
  }
}
