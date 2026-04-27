import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { PaginationEntreeDTO } from '../../dto/input/PaginationEntreeDTO';
import { EleveSortieDTO } from '../../dto/output/EleveSortieDTO';
import { PageResultatSortieDTO } from '../../dto/output/PageResultatSortieDTO';
import { EleveMapper } from '../../mappers/EleveMapper';
import { ServiceApplicationPagination } from '../../services/ServiceApplicationPagination';

// Ce fichier contient le cas d'usage de liste des eleves d'une ecole.
export interface ListerElevesEntree extends PaginationEntreeDTO { idEcole: string }

/** Ce cas d'usage liste les eleves d'une ecole avec pagination applicative. */
export class ListerEleves implements UseCase<ListerElevesEntree, PageResultatSortieDTO<EleveSortieDTO>> {
  constructor(
    private readonly depotEleve: DepotEleve,
    private readonly servicePagination: ServiceApplicationPagination = new ServiceApplicationPagination(),
  ) {}

  /** Execute la liste des eleves. */
  public async executer(entree: ListerElevesEntree): Promise<PageResultatSortieDTO<EleveSortieDTO>> {
    const pagination = this.servicePagination.normaliser(entree);
    const eleves = await this.depotEleve.listerParEcole(entree.idEcole);

    return {
      donnees: this.servicePagination.paginer(eleves, pagination).map(EleveMapper.versSortie),
      total: eleves.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
