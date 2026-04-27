import { Pagination } from '../../../../shared/application/Pagination';
import { PaginationEntreeDTO } from '../dto/input/PaginationEntreeDTO';

// Ce fichier contient le service applicatif de normalisation de pagination.
/**
 * Ce service impose des limites de pagination pour toutes les queries.
 */
export class ServiceApplicationPagination {
  /** Normalise page et taillePage avec des bornes defensives. */
  public normaliser(entree: PaginationEntreeDTO = {}): Pagination {
    const page = entree.page === undefined || entree.page < 1 ? 1 : Math.floor(entree.page);
    const tailleDemandee = entree.taillePage === undefined || entree.taillePage < 1 ? 25 : Math.floor(entree.taillePage);

    return {
      page,
      taillePage: Math.min(tailleDemandee, 100),
    };
  }

  /** Applique une pagination en memoire pour les depots qui ne paginent pas encore. */
  public paginer<TElement>(donnees: TElement[], pagination: Pagination): TElement[] {
    const depart = (pagination.page - 1) * pagination.taillePage;
    return donnees.slice(depart, depart + pagination.taillePage);
  }
}
