import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { CritereRechercheEleveEntreeDTO } from '../../dto/input/CritereRechercheEleveEntreeDTO';
import { EleveSortieDTO } from '../../dto/output/EleveSortieDTO';
import { PageResultatSortieDTO } from '../../dto/output/PageResultatSortieDTO';
import { EleveMapper } from '../../mappers/EleveMapper';
import type { AutorisationElevePort } from '../../ports';
import { ServiceApplicationPagination } from '../../services/ServiceApplicationPagination';

// Ce fichier contient le cas d'usage de recherche des eleves.
/** Ce cas d'usage recherche les eleves a partir des criteres d'identite. */
export class RechercherEleves implements UseCase<CritereRechercheEleveEntreeDTO, PageResultatSortieDTO<EleveSortieDTO>> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly autorisationEleve?: AutorisationElevePort,
    private readonly servicePagination: ServiceApplicationPagination = new ServiceApplicationPagination(),
  ) {}

  /** Execute la recherche d'eleves. */
  public async executer(entree: CritereRechercheEleveEntreeDTO): Promise<PageResultatSortieDTO<EleveSortieDTO>> {
    if (entree.idEcole === undefined) {
      return {
        donnees: [],
        total: 0,
        page: this.servicePagination.normaliser(entree).page,
        taillePage: this.servicePagination.normaliser(entree).taillePage,
      };
    }

    await this.autorisationEleve?.verifierLectureEleve({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
    });

    const pagination = this.servicePagination.normaliser(entree);
    const eleves = await this.depotEleve.rechercherParIdentite({
      idEcole: entree.idEcole,
      nom: entree.nom ?? '',
      postNom: entree.postNom ?? '',
      prenom: entree.prenom,
      dateNaissance: entree.dateNaissance,
    });

    return {
      donnees: this.servicePagination.paginer(eleves, pagination).map(EleveMapper.versSortie),
      total: eleves.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
