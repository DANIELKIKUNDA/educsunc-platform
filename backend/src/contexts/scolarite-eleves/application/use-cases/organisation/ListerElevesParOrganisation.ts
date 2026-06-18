import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { PaginationEntreeDTO } from '../../dto/input/PaginationEntreeDTO';
import { EleveSortieDTO } from '../../dto/output/EleveSortieDTO';
import { PageResultatSortieDTO } from '../../dto/output/PageResultatSortieDTO';
import { EleveMapper } from '../../mappers/EleveMapper';
import type { AutorisationOrganisationScolaritePort } from '../../ports';
import { ServiceApplicationPagination } from '../../services/ServiceApplicationPagination';

// Ce fichier contient le cas d'usage de lecture des eleves d'une organisation.
export interface ListerElevesParOrganisationEntree extends PaginationEntreeDTO {
  idOrganisation: string;
  idUtilisateur: string;
}

/** Ce cas d'usage liste les eleves a l'echelle organisationnelle. */
export class ListerElevesParOrganisation implements UseCase<ListerElevesParOrganisationEntree, PageResultatSortieDTO<EleveSortieDTO>> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly autorisationOrganisation?: AutorisationOrganisationScolaritePort,
    private readonly servicePagination: ServiceApplicationPagination = new ServiceApplicationPagination(),
  ) {}

  /** Execute la liste organisationnelle des eleves. */
  public async executer(entree: ListerElevesParOrganisationEntree): Promise<PageResultatSortieDTO<EleveSortieDTO>> {
    await this.autorisationOrganisation?.verifierLectureOrganisationScolarite({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
    });

    const pagination = this.servicePagination.normaliser(entree);
    const eleves = await this.depotEleve.listerParOrganisation(entree.idOrganisation);

    return {
      donnees: this.servicePagination.paginer(eleves, pagination).map(EleveMapper.versSortie),
      total: eleves.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
