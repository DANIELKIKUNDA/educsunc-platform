import { ErreurInscriptionDejaExistante } from '../exceptions/ErreurInscriptionDejaExistante';

// Ce fichier contient la regle d'unicite d'inscription annuelle.
/**
 * Cette policy interdit deux inscriptions actives pour le meme eleve sur la meme annee.
 */
export class PolicyUniciteInscriptionAnnuelle {
  /** Refuse la creation si une inscription active existe deja. */
  public verifierAucuneInscriptionActiveExistante(inscriptionActiveExiste: boolean): void {
    if (inscriptionActiveExiste) {
      throw new ErreurInscriptionDejaExistante('Une inscription active existe deja pour cet eleve et cette annee.');
    }
  }
}
