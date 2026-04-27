import { ErreurSuppressionPhysiqueInterdite } from '../exceptions/ErreurSuppressionPhysiqueInterdite';

// Ce fichier contient la regle qui interdit toute suppression physique dans le BC Scolarite.
/**
 * Cette policy protege les donnees scolaires contre la suppression definitive.
 */
export class PolicySuppressionPhysiqueInterdite {
  /** Refuse toute demande de suppression physique d'un agregat metier. */
  public verifierSuppressionPhysiqueInterdite(nomAgregat: string): never {
    throw new ErreurSuppressionPhysiqueInterdite(`${nomAgregat} ne peut pas etre supprime physiquement.`);
  }
}
