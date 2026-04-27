import { ErreurOrganisationEcoleIncoherente } from '../exceptions/ErreurOrganisationEcoleIncoherente';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient la regle de coherence entre famille et eleve.
/**
 * Cette policy verifie qu'un eleve rattache une famille de la meme ecole.
 */
export class PolicyCoherenceFamilleEleve {
  /** Refuse le rattachement si la famille et l'eleve ne sont pas dans la meme ecole. */
  public verifierMemeEcole(idEcoleEleve: UUID, idEcoleFamille: UUID): void {
    if (idEcoleEleve !== idEcoleFamille) {
      throw new ErreurOrganisationEcoleIncoherente('Un eleve ne peut etre rattache qu a une famille de la meme ecole.');
    }
  }
}
