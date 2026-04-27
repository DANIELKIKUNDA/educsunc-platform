import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { EvenementParcoursSortieDTO } from '../../dto/output/EvenementParcoursSortieDTO';
import { EvenementParcoursMapper } from '../../mappers/EvenementParcoursMapper';

// Ce fichier contient le cas d'usage de liste des evenements par eleve.
export interface ListerEvenementsParEleveEntree { idEleve: string }

/** Ce cas d'usage liste les evenements de parcours d'un eleve. */
export class ListerEvenementsParEleve implements UseCase<ListerEvenementsParEleveEntree, EvenementParcoursSortieDTO[]> {
  constructor(private readonly depotParcours: DepotParcoursScolaireEleve) {}
  /** Execute la liste des evenements. */
  public async executer(entree: ListerEvenementsParEleveEntree): Promise<EvenementParcoursSortieDTO[]> {
    return (await this.depotParcours.listerEvenementsParEleve(entree.idEleve)).map(EvenementParcoursMapper.versSortie);
  }
}
