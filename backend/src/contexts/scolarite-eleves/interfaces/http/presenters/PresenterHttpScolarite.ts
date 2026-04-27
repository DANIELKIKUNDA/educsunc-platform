import { PageResultatSortieDTO } from '../../../application/dto/output/PageResultatSortieDTO';

// Ce fichier contient les helpers communs de presentation HTTP du BC.
export interface ReponseDetailHttp<TDonnee> { donnee: TDonnee }
export interface ReponseListeHttp<TDonnee> {
  donnees: TDonnee[];
  pagination?: { total: number; page: number; taillePage: number; totalPages: number };
}

/**
 * Ce presenter commun normalise les reponses detail et pagination.
 */
export class PresenterHttpScolarite {
  /** Presente une ressource unique. */
  public static detail<TDonnee>(donnee: TDonnee): ReponseDetailHttp<TDonnee> {
    return { donnee };
  }

  /** Presente une liste eventuellement paginee. */
  public static liste<TDonnee>(donnees: TDonnee[] | PageResultatSortieDTO<TDonnee>): ReponseListeHttp<TDonnee> {
    if (Array.isArray(donnees)) return { donnees };
    return {
      donnees: donnees.donnees,
      pagination: {
        total: donnees.total,
        page: donnees.page,
        taillePage: donnees.taillePage,
        totalPages: donnees.taillePage <= 0 ? 0 : Math.ceil(donnees.total / donnees.taillePage),
      },
    };
  }
}
