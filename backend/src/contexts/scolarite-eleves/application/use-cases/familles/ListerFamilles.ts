import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotFamille } from '../../../domain/repositories/DepotFamille';
import { PaginationEntreeDTO } from '../../dto/input/PaginationEntreeDTO';
import { FamilleSortieDTO } from '../../dto/output/FamilleSortieDTO';
import { PageResultatSortieDTO } from '../../dto/output/PageResultatSortieDTO';
import { FamilleMapper } from '../../mappers/FamilleMapper';
import { ServiceApplicationPagination } from '../../services/ServiceApplicationPagination';

// Ce fichier contient le cas d'usage de liste des familles.
export interface ListerFamillesEntree extends PaginationEntreeDTO { idEcole: string }

/** Ce cas d'usage liste les familles d'une ecole avec pagination. */
export class ListerFamilles implements UseCase<ListerFamillesEntree, PageResultatSortieDTO<FamilleSortieDTO>> {
  constructor(
    private readonly depotFamille: DepotFamille,
    private readonly servicePagination: ServiceApplicationPagination = new ServiceApplicationPagination(),
  ) {}

  /** Execute la liste des familles. */
  public async executer(entree: ListerFamillesEntree): Promise<PageResultatSortieDTO<FamilleSortieDTO>> {
    const pagination = this.servicePagination.normaliser(entree);
    const familles = await this.depotFamille.listerParEcole(entree.idEcole);

    return {
      donnees: this.servicePagination.paginer(familles, pagination).map(FamilleMapper.versSortie),
      total: familles.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }
}
