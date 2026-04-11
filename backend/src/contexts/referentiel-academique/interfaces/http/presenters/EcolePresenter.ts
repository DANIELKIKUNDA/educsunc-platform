import { EcoleSortie } from '../../../application/dto/output/EcoleSortie';
import { ListerEcolesParOrganisationSortie } from '../../../application/dto/output/ListerEcolesParOrganisationSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une ecole.
export interface ReponseEcoleHttp {
  donnee: EcoleSortie;
}

// Cette interface represente la reponse HTTP paginee des ecoles.
export interface ReponseListeEcolesHttp {
  donnees: EcoleSortie[];
  pagination: PaginationHttp;
}

// Ce presenter transforme les sorties applicatives des ecoles en reponses HTTP coherentes.
export class EcolePresenter {
  // Cette methode presente le detail HTTP d'une ecole.
  public static presenterEcole(ecole: EcoleSortie): ReponseEcoleHttp {
    return {
      donnee: this.copierEcole(ecole),
    };
  }

  // Cette methode presente la liste HTTP paginee des ecoles.
  public static presenterListeEcoles(
    sortie: ListerEcolesParOrganisationSortie,
  ): ReponseListeEcolesHttp {
    return {
      donnees: sortie.ecoles.map((ecole) => this.copierEcole(ecole)),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode produit une copie stable d'une ecole pour la reponse HTTP.
  private static copierEcole(ecole: EcoleSortie): EcoleSortie {
    return {
      ...ecole,
    };
  }

  // Cette methode construit le bloc de pagination HTTP.
  private static creerPagination(
    total: number,
    page: number,
    taillePage: number,
  ): PaginationHttp {
    return {
      total,
      page,
      taillePage,
      totalPages: taillePage <= 0 ? 0 : Math.ceil(total / taillePage),
    };
  }
}
