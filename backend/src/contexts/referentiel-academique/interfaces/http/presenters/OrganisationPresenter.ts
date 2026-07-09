import { ListerOrganisationsSortie } from '../../../application/dto/output/ListerOrganisationsSortie';
import { OrganisationSortie } from '../../../application/dto/output/OrganisationSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

interface ResponsablePrincipalIndicateursHttp {
  utilisateurId?: string;
  etatCompte: string;
  dernierAccesLe?: string;
  dernierLoginLe?: string;
}

interface EvenementHistoriqueOrganisationHttp {
  id: string;
  action: string;
  acteur?: string;
  description: string;
  creeLe: string;
  details?: Readonly<Record<string, unknown>>;
}

// Cette interface represente la reponse HTTP de detail d'une organisation.
export interface ReponseOrganisationHttp {
  donnee: OrganisationSortie;
}

export interface ReponseIndicateursOrganisationHttp {
  donnee: {
    organisationId: string;
    totalUtilisateursActifs: number;
    responsablePrincipal?: ResponsablePrincipalIndicateursHttp;
  };
}

export interface ReponseHistoriqueOrganisationHttp {
  donnee: {
    evenements: readonly EvenementHistoriqueOrganisationHttp[];
  };
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

  public static presenterIndicateursOrganisation(
    indicateurs: ReponseIndicateursOrganisationHttp['donnee'],
  ): ReponseIndicateursOrganisationHttp {
    return {
      donnee: {
        organisationId: indicateurs.organisationId,
        totalUtilisateursActifs: indicateurs.totalUtilisateursActifs,
        responsablePrincipal: indicateurs.responsablePrincipal
          ? { ...indicateurs.responsablePrincipal }
          : undefined,
      },
    };
  }

  public static presenterHistoriqueOrganisation(
    historique: readonly EvenementHistoriqueOrganisationHttp[],
  ): ReponseHistoriqueOrganisationHttp {
    return {
      donnee: {
        evenements: historique.map((evenement) => ({
          id: evenement.id,
          action: evenement.action,
          acteur: evenement.acteur,
          description: evenement.description,
          creeLe: evenement.creeLe,
          details: evenement.details ? { ...evenement.details } : undefined,
        })),
      },
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
