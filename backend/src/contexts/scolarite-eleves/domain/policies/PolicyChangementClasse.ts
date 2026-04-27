import { ErreurAffectationInexistante } from '../exceptions/ErreurAffectationInexistante';

// Ce fichier contient la regle de changement de classe.
/**
 * Cette policy impose que l'ancienne affectation soit conservee ou desactivee, jamais effacee.
 */
export class PolicyChangementClasse {
  /** Verifie qu'une affectation active existe avant un changement de classe. */
  public verifierAffectationActivePresente(affectationActiveExiste: boolean): void {
    if (!affectationActiveExiste) {
      throw new ErreurAffectationInexistante('Aucune affectation active ne permet un changement de classe.');
    }
  }
}
