import { ErreurSuppressionPhysiqueInterdite } from '../exceptions/ErreurSuppressionPhysiqueInterdite';

// Cette policy centralise l'interdiction de suppression physique.
export class PolicySuppressionPhysiqueInterdite {
  // Cette methode leve toujours une erreur pour bloquer la suppression physique.
  public interdire(): never {
    throw new ErreurSuppressionPhysiqueInterdite();
  }
}
