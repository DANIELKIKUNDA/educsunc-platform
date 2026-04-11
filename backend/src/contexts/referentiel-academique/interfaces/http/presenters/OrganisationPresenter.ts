import { ListerOrganisationsSortie } from '../../../application/dto/output/ListerOrganisationsSortie';
import { OrganisationSortie } from '../../../application/dto/output/OrganisationSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une organisation.
export interface ReponseOrganisationHttp {
  donnee: OrganisationSortie;
}

// Cette interface represente la reponse HTTP paginee des organisations.
export interface ReponseListeOrganisationsHttp {
  donnees: OrganisationSortie[];
  pagination: PaginationHttp;
}

// Ce presenter transforme les sorties applicatives des organisations en reponses HTTP coherentes.
export class OrganisationPresenter {
  // Cette methode presente le detail HTTP d'une organisation.
  public static presenterOrganisation(
    organisation: OrganisationSortie,
  ): ReponseOrganisationHttp {
    return {
      donnee: this.copierOrganisation(organisation),
    };
  }

  // Cette methode presente la liste HTTP paginee des organisations.
  public static presenterListeOrganisations(
    sortie: ListerOrganisationsSortie,
  ): ReponseListeOrganisationsHttp {
    return {
      donnees: sortie.organisations.map((organisation) =>
        this.copierOrganisation(organisation)
      ),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode produit une copie stable d'une organisation pour la reponse HTTP.
  private static copierOrganisation(
    organisation: OrganisationSortie,
  ): OrganisationSortie {
    return {
      ...organisation,
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
