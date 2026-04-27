import { ParcoursScolaireEleve } from '../../domain/aggregates/ParcoursScolaireEleve';
import { ParcoursEleveSortieDTO } from '../dto/output/ParcoursEleveSortieDTO';
import { EvenementParcoursMapper } from './EvenementParcoursMapper';

// Ce fichier transforme l'agregat ParcoursScolaireEleve en DTO applicatif.
/**
 * Ce mapper projette le parcours complet et son historique.
 */
export class ParcoursEleveMapper {
  /** Transforme un parcours scolaire en DTO. */
  public static versSortie(parcours: ParcoursScolaireEleve): ParcoursEleveSortieDTO {
    const proprietes = parcours.versProprietes();

    return {
      idParcoursScolaireEleve: proprietes.idParcoursScolaireEleve,
      idOrganisation: proprietes.idOrganisation,
      idEcole: proprietes.idEcole,
      idEleve: proprietes.idEleve,
      historique: proprietes.historique.map(EvenementParcoursMapper.versSortie),
      version: proprietes.version,
    };
  }
}
