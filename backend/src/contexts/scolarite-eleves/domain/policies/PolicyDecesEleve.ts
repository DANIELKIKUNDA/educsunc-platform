import { ErreurEleveDejaDecede } from '../exceptions/ErreurEleveDejaDecede';
import { StatutEleve } from '../value-objects/StatutEleve';

// Ce fichier contient la regle du statut final DECEDE.
/**
 * Cette policy empeche toute modification active apres le deces.
 */
export class PolicyDecesEleve {
  /** Refuse une operation active sur un eleve decede. */
  public verifierEleveNonDecede(statutActuel: StatutEleve): void {
    if (statutActuel === StatutEleve.DECEDE) {
      throw new ErreurEleveDejaDecede('Un eleve decede ne peut plus etre modifie comme eleve actif.');
    }
  }
}
