import { ErreurClasseEtInscriptionIncoherentes } from '../exceptions/ErreurClasseEtInscriptionIncoherentes';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle qui rattache l'affectation a la meme annee que l'inscription.
/**
 * Cette policy verifie la coherence annuelle de l'affectation.
 */
export class PolicyAffectationAnnuelle {
  /** Refuse l'affectation si la classe et l'inscription ne sont pas dans la meme annee scolaire. */
  public verifierMemeAnneeScolaire(idAnneeInscription: UUID, idAnneeClasse: UUID): void {
    if (idAnneeInscription !== idAnneeClasse) {
      throw new ErreurClasseEtInscriptionIncoherentes('L affectation doit rester dans la meme annee scolaire que l inscription.');
    }
  }
}
