import { AnneeScolaireSortie } from '../../../application/dto/output/AnneeScolaireSortie';
import { ListerAnneesScolairesParEcoleSortie } from '../../../application/dto/output/ListerAnneesScolairesParEcoleSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une annee scolaire.
export interface ReponseAnneeScolaireHttp {
  donnee: AnneeScolaireSortie;
}

// Cette interface represente la reponse HTTP paginee des annees scolaires.
export interface ReponseListeAnneesScolairesHttp {
  donnees: AnneeScolaireSortie[];
  pagination: PaginationHttp;
}

// Ce presenter transforme les sorties applicatives des annees scolaires en reponses HTTP coherentes.
export class AnneeScolairePresenter {
  // Cette methode presente le detail HTTP d'une annee scolaire.
  public static presenterAnneeScolaire(
    anneeScolaire: AnneeScolaireSortie,
  ): ReponseAnneeScolaireHttp {
    return {
      donnee: this.copierAnneeScolaire(anneeScolaire),
    };
  }

  // Cette methode presente la liste HTTP paginee des annees scolaires.
  public static presenterListeAnneesScolaires(
    sortie: ListerAnneesScolairesParEcoleSortie,
  ): ReponseListeAnneesScolairesHttp {
    return {
      donnees: sortie.anneesScolaires.map((anneeScolaire) =>
        this.copierAnneeScolaire(anneeScolaire)
      ),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode produit une copie stable d'une annee scolaire pour la reponse HTTP.
  private static copierAnneeScolaire(
    anneeScolaire: AnneeScolaireSortie,
  ): AnneeScolaireSortie {
    return {
      ...anneeScolaire,
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
