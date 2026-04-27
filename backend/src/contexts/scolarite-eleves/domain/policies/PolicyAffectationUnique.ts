import { ErreurAffectationDejaActive } from '../exceptions/ErreurAffectationDejaActive';

// Ce fichier contient la regle d'unicite de l'affectation active.
/**
 * Cette policy interdit deux affectations actives pour la meme inscription.
 */
export class PolicyAffectationUnique {
  /** Refuse une nouvelle affectation active si une autre existe deja. */
  public verifierAucuneAffectationActiveExistante(affectationActiveExiste: boolean): void {
    if (affectationActiveExiste) {
      throw new ErreurAffectationDejaActive('Une affectation active existe deja pour cette inscription.');
    }
  }
}
