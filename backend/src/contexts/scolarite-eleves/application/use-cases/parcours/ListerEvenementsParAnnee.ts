import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { EvenementParcoursSortieDTO } from '../../dto/output/EvenementParcoursSortieDTO';
import { EvenementParcoursMapper } from '../../mappers/EvenementParcoursMapper';

// Ce fichier contient le cas d'usage de liste des evenements par annee scolaire.
export interface ListerEvenementsParAnneeEntree { idAnneeScolaire: string }

/** Ce cas d'usage liste les evenements de parcours d'une annee scolaire. */
export class ListerEvenementsParAnnee implements UseCase<ListerEvenementsParAnneeEntree, EvenementParcoursSortieDTO[]> {
  constructor(private readonly depotParcours: DepotParcoursScolaireEleve) {}
  /** Execute la liste par annee. */
  public async executer(entree: ListerEvenementsParAnneeEntree): Promise<EvenementParcoursSortieDTO[]> {
    return (await this.depotParcours.listerEvenementsParAnnee(entree.idAnneeScolaire)).map(EvenementParcoursMapper.versSortie);
  }
}
