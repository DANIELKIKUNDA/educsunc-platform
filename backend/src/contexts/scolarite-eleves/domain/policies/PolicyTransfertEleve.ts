import { ErreurTransitionStatutInterdite } from '../exceptions/ErreurTransitionStatutInterdite';
import { StatutEleve } from '../value-objects/StatutEleve';

// Ce fichier contient la regle de transfert sortant.
/**
 * Cette policy empeche de traiter un eleve transfere comme actif dans l'ecole source.
 */
export class PolicyTransfertEleve {
  /** Refuse une operation active sur un eleve transfere. */
  public verifierEleveNonTransferePourOperationActive(statutActuel: StatutEleve): void {
    if (statutActuel === StatutEleve.TRANSFERE) {
      throw new ErreurTransitionStatutInterdite('Un eleve transfere ne doit plus etre traite comme actif dans l ecole source.');
    }
  }
}
