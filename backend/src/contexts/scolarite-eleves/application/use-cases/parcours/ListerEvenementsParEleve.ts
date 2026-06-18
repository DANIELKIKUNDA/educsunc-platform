import { UseCase } from '../../../../../shared/application/UseCase';
import type { AutorisationParcoursElevePort } from '../../ports';
import { DepotParcoursScolaireEleve } from '../../../domain/repositories/DepotParcoursScolaireEleve';
import { EvenementParcoursSortieDTO } from '../../dto/output/EvenementParcoursSortieDTO';
import { EvenementParcoursMapper } from '../../mappers/EvenementParcoursMapper';

// Ce fichier contient le cas d'usage de liste des evenements par eleve.
export interface ListerEvenementsParEleveEntree {
  idEleve: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}

/** Ce cas d'usage liste les evenements de parcours d'un eleve. */
export class ListerEvenementsParEleve implements UseCase<ListerEvenementsParEleveEntree, EvenementParcoursSortieDTO[]> {
  constructor(
    private readonly depotParcours: DepotParcoursScolaireEleve,
    private readonly autorisationParcours?: AutorisationParcoursElevePort,
  ) {}
  /** Execute la liste des evenements. */
  public async executer(entree: ListerEvenementsParEleveEntree): Promise<EvenementParcoursSortieDTO[]> {
    await this.autorisationParcours?.verifierConsultationParcoursEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idEleve: entree.idEleve,
    });
    return (await this.depotParcours.listerEvenementsParEleve(entree.idEleve)).map(EvenementParcoursMapper.versSortie);
  }
}
