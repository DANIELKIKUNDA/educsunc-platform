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

// Cette interface represente la reponse HTTP optionnelle d'une annee scolaire.
export interface ReponseAnneeScolaireOptionnelleHttp {
  donnee: AnneeScolaireSortie | null;
}

// Cette interface represente la reponse HTTP paginee des annees scolaires.
export interface ReponseListeAnneesScolairesHttp {
  donnees: AnneeScolaireSortie[];
  pagination: PaginationHttp;
}

// Cette interface represente la reponse HTTP de preparation annuelle.
export interface ReponsePreparationAnneeScolaireHttp {
  donnee: AnneeScolaireSortie;
  meta: {
    dejaExistante: boolean;
  };
}

// Cette interface represente la reponse HTTP de garantie d'annee active.
export interface ReponseGarantieAnneeActiveHttp {
  donnee: AnneeScolaireSortie;
  meta: {
    action: string;
  };
}

// Cette interface represente la reponse HTTP de bascule annuelle.
export interface ReponseBasculeAnneeScolaireHttp {
  donnee: {
    anneeCloturee: AnneeScolaireSortie;
    anneeActive: AnneeScolaireSortie;
  };
  meta: {
    anneeSuivanteCreee: boolean;
  };
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

  // Cette methode presente une annee scolaire optionnelle.
  public static presenterAnneeScolaireOptionnelle(
    anneeScolaire: AnneeScolaireSortie | null,
  ): ReponseAnneeScolaireOptionnelleHttp {
    return {
      donnee: anneeScolaire === null ? null : this.copierAnneeScolaire(anneeScolaire),
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

  // Cette methode presente le resultat de preparation de l'annee suivante.
  public static presenterPreparationAnneeScolaire(
    anneeScolaire: AnneeScolaireSortie,
    dejaExistante: boolean,
  ): ReponsePreparationAnneeScolaireHttp {
    return {
      donnee: this.copierAnneeScolaire(anneeScolaire),
      meta: {
        dejaExistante,
      },
    };
  }

  // Cette methode presente le resultat de garantie d'une annee active.
  public static presenterGarantieAnneeActive(
    anneeScolaire: AnneeScolaireSortie,
    action: string,
  ): ReponseGarantieAnneeActiveHttp {
    return {
      donnee: this.copierAnneeScolaire(anneeScolaire),
      meta: {
        action,
      },
    };
  }

  // Cette methode presente le resultat de bascule annuelle.
  public static presenterBasculeAnneeScolaire(
    anneeCloturee: AnneeScolaireSortie,
    anneeActive: AnneeScolaireSortie,
    anneeSuivanteCreee: boolean,
  ): ReponseBasculeAnneeScolaireHttp {
    return {
      donnee: {
        anneeCloturee: this.copierAnneeScolaire(anneeCloturee),
        anneeActive: this.copierAnneeScolaire(anneeActive),
      },
      meta: {
        anneeSuivanteCreee,
      },
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
