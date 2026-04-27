import { EvenementParcours } from '../../domain/entities/EvenementParcours';
import { EvenementParcoursSortieDTO } from '../dto/output/EvenementParcoursSortieDTO';

// Ce fichier transforme une entite EvenementParcours en DTO applicatif.
/**
 * Ce mapper expose un evenement d'historique sous forme lisible.
 */
export class EvenementParcoursMapper {
  /** Transforme un evenement de parcours en DTO. */
  public static versSortie(evenement: EvenementParcours): EvenementParcoursSortieDTO {
    const proprietes = evenement.versProprietes();

    return {
      idEvenementParcours: proprietes.idEvenementParcours,
      typeEvenement: proprietes.typeEvenement,
      dateEvenement: proprietes.dateEvenement.toISOString(),
      idAnneeScolaire: proprietes.idAnneeScolaire,
      idClassePedagogique: proprietes.idClassePedagogique,
      referenceMetier: proprietes.referenceMetier,
      description: proprietes.description,
      declenchePar: proprietes.declenchePar,
    };
  }
}
