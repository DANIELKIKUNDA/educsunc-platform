import { ErreurInscriptionNonValide } from '../exceptions/ErreurInscriptionNonValide';

// Ce fichier contient la regle qui rend l'inscription strictement annuelle.
/**
 * Cette policy verifie qu'une inscription porte une annee scolaire.
 */
export class PolicyInscriptionAnnuelle {
  /** Refuse une inscription sans annee scolaire. */
  public verifierAnneeScolairePresente(idAnneeScolaire?: string): void {
    if (idAnneeScolaire === undefined || idAnneeScolaire.trim().length === 0) {
      throw new ErreurInscriptionNonValide('Une inscription doit etre rattachee a une annee scolaire.');
    }
  }
}
