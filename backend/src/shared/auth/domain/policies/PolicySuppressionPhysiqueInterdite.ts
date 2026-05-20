import { ErreurAuth } from '../exceptions/ErreurAuth';

// Cette policy bloque toute tentative de suppression physique dans AUTH.
export class PolicySuppressionPhysiqueInterdite {
  public static interdire(): never {
    throw new ErreurAuth('La suppression physique est interdite dans AUTH.');
  }
}
