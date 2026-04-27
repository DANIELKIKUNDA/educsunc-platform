import { InscriptionScolaire } from '../../domain/aggregates/InscriptionScolaire';
import { InscriptionScolaireSortieDTO } from '../dto/output/InscriptionScolaireSortieDTO';

// Ce fichier transforme l'agregat InscriptionScolaire en DTO applicatif.
/**
 * Ce mapper expose l'inscription annuelle sans logique metier.
 */
export class InscriptionScolaireMapper {
  /** Transforme une inscription scolaire en DTO. */
  public static versSortie(inscription: InscriptionScolaire): InscriptionScolaireSortieDTO {
    const proprietes = inscription.versProprietes();

    return {
      idInscriptionScolaire: proprietes.idInscriptionScolaire,
      idOrganisation: proprietes.idOrganisation,
      idEcole: proprietes.idEcole,
      idEleve: proprietes.idEleve,
      idAnneeScolaire: proprietes.idAnneeScolaire,
      dateInscription: proprietes.dateInscription,
      origineInscription: proprietes.origineInscription,
      statutInscription: proprietes.statutInscription,
      numeroOrdre: proprietes.numeroOrdre,
      observation: proprietes.observation,
      version: proprietes.version,
    };
  }
}
