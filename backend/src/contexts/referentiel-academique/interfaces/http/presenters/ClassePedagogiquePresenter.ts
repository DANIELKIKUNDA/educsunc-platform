import { ClassePedagogiqueSortie } from '../../../application/dto/output/ClassePedagogiqueSortie';
import { ListerClassesPedagogiquesParEcoleEtAnneeSortie } from '../../../application/dto/output/ListerClassesPedagogiquesParEcoleEtAnneeSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une classe pedagogique.
export interface ReponseClassePedagogiqueHttp {
  donnee: ClassePedagogiqueSortie;
}

// Cette interface represente la reponse HTTP paginee des classes pedagogiques.
export interface ReponseListeClassesPedagogiquesHttp {
  donnees: ClassePedagogiqueSortie[];
  pagination: PaginationHttp;
}

// Ce presenter transforme les sorties applicatives des classes pedagogiques en reponses HTTP coherentes.
export class ClassePedagogiquePresenter {
  // Cette methode presente le detail HTTP d'une classe pedagogique.
  public static presenterClassePedagogique(
    classePedagogique: ClassePedagogiqueSortie,
  ): ReponseClassePedagogiqueHttp {
    return {
      donnee: this.copierClassePedagogique(classePedagogique),
    };
  }

  // Cette methode presente la liste HTTP paginee des classes pedagogiques.
  public static presenterListeClassesPedagogiques(
    sortie: ListerClassesPedagogiquesParEcoleEtAnneeSortie,
  ): ReponseListeClassesPedagogiquesHttp {
    return {
      donnees: sortie.classesPedagogiques.map((classePedagogique) =>
        this.copierClassePedagogique(classePedagogique)
      ),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode produit une copie stable d'une classe pedagogique pour la reponse HTTP.
  private static copierClassePedagogique(
    classePedagogique: ClassePedagogiqueSortie,
  ): ClassePedagogiqueSortie {
    return {
      ...classePedagogique,
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
