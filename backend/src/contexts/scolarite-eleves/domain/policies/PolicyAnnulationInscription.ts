import { ErreurInscriptionAnnulee } from '../exceptions/ErreurInscriptionAnnulee';
import { StatutInscription } from '../value-objects/StatutInscription';

// Ce fichier contient la regle d'annulation d'inscription.
/**
 * Cette policy empeche de traiter une inscription annulee comme active.
 */
export class PolicyAnnulationInscription {
  /** Refuse une operation active sur une inscription annulee. */
  public verifierInscriptionNonAnnulee(statutInscription: StatutInscription): void {
    if (statutInscription === StatutInscription.ANNULEE) {
      throw new ErreurInscriptionAnnulee('Une inscription annulee ne peut pas etre traitee comme active.');
    }
  }
}
