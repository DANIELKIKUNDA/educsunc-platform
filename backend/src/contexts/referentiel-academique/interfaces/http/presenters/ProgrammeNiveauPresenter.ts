import { EtatLocalProgrammeNiveauSortie } from '../../../application/dto/output/EtatLocalProgrammeNiveauSortie';
import { LigneProgrammeNiveauSortie } from '../../../application/dto/output/LigneProgrammeNiveauSortie';
import { ListerProgrammesNiveauParEcoleEtAnneeSortie } from '../../../application/dto/output/ListerProgrammesNiveauParEcoleEtAnneeSortie';
import { ProgrammeNiveauSortie } from '../../../application/dto/output/ProgrammeNiveauSortie';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'un programme niveau.
export interface ReponseProgrammeNiveauHttp {
  donnee: ProgrammeNiveauSortie;
}

// Cette interface represente la reponse HTTP paginee des programmes niveau.
export interface ReponseListeProgrammesNiveauHttp {
  donnees: ProgrammeNiveauSortie[];
  pagination: PaginationHttp;
}

// Cette interface represente la reponse HTTP de l'etat local d'un programme niveau.
export interface ReponseEtatLocalProgrammeNiveauHttp {
  donnee: EtatLocalProgrammeNiveauSortie;
}

// Ce presenter transforme les sorties applicatives des programmes niveau en reponses HTTP coherentes.
export class ProgrammeNiveauPresenter {
  // Cette methode presente le detail HTTP d'un programme niveau.
  public static presenterProgrammeNiveau(
    programmeNiveau: ProgrammeNiveauSortie,
  ): ReponseProgrammeNiveauHttp {
    return {
      donnee: this.copierProgrammeNiveau(programmeNiveau),
    };
  }

  // Cette methode presente la liste HTTP paginee des programmes niveau.
  public static presenterListeProgrammesNiveau(
    sortie: ListerProgrammesNiveauParEcoleEtAnneeSortie,
  ): ReponseListeProgrammesNiveauHttp {
    return {
      donnees: sortie.programmesNiveau.map((programmeNiveau) =>
        this.copierProgrammeNiveau(programmeNiveau)
      ),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode presente l'etat local HTTP d'un programme niveau.
  public static presenterEtatLocalProgrammeNiveau(
    etatLocalProgrammeNiveau: EtatLocalProgrammeNiveauSortie,
  ): ReponseEtatLocalProgrammeNiveauHttp {
    return {
      donnee: {
        ...etatLocalProgrammeNiveau,
        lignes: etatLocalProgrammeNiveau.lignes.map((ligne) =>
          this.copierLigneProgrammeNiveau(ligne)
        ),
      },
    };
  }

  // Cette methode produit une copie stable d'un programme niveau pour la reponse HTTP.
  private static copierProgrammeNiveau(
    programmeNiveau: ProgrammeNiveauSortie,
  ): ProgrammeNiveauSortie {
    return {
      ...programmeNiveau,
      lignes: programmeNiveau.lignes.map((ligne) => this.copierLigneProgrammeNiveau(ligne)),
    };
  }

  // Cette methode produit une copie stable d'une ligne locale de programme.
  private static copierLigneProgrammeNiveau(
    ligneProgrammeNiveau: LigneProgrammeNiveauSortie,
  ): LigneProgrammeNiveauSortie {
    return {
      ...ligneProgrammeNiveau,
      ponderation: {
        ...ligneProgrammeNiveau.ponderation,
      },
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
