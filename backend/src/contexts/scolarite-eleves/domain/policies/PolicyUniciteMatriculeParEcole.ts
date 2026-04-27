import { ErreurMatriculeDejaExistant } from '../exceptions/ErreurMatriculeDejaExistant';

// Ce fichier contient la regle d'unicite du matricule dans une ecole.
/**
 * Cette policy empeche deux eleves d'une meme ecole de porter le meme matricule.
 */
export class PolicyUniciteMatriculeParEcole {
  /** Refuse un matricule deja existant dans l'ecole. */
  public verifierMatriculeDisponible(matriculeExisteDeja: boolean): void {
    if (matriculeExisteDeja) {
      throw new ErreurMatriculeDejaExistant('Le matricule existe deja dans cette ecole.');
    }
  }
}
