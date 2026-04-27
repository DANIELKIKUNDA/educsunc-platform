import { ErreurClasseEtInscriptionIncoherentes } from '../exceptions/ErreurClasseEtInscriptionIncoherentes';

// Ce fichier contient la regle de coherence entre inscription et classe.
/**
 * Cette policy verifie que la classe choisie est compatible avec l'inscription.
 */
export class PolicyCoherenceInscriptionClasse {
  /** Refuse l'affectation si ecole ou annee scolaire divergent. */
  public verifierCoherence(memeEcole: boolean, memeAnneeScolaire: boolean): void {
    if (!memeEcole || !memeAnneeScolaire) {
      throw new ErreurClasseEtInscriptionIncoherentes('La classe et l inscription doivent partager la meme ecole et la meme annee scolaire.');
    }
  }
}
