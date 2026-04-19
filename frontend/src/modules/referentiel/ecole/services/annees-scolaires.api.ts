import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ReponseAnneeScolaireOptionnelle,
  ReponseListeAnneesScolaires,
  ReponsePreparationAnneeScolaire,
} from '../../commun/types/annees-scolaires.types';

export interface ParametresListeAnneesScolaires {
  idEcole: string;
  page: number;
  taillePage: number;
}

export interface ParametresConsultationAnneeActive {
  idEcole: string;
}

export interface ParametresPreparationAnneeScolaireSuivante {
  idEcole: string;
  creePar: string;
  dateDebut?: string;
  dateFin?: string;
}

function construireCheminAnneesScolaires(parametres: ParametresListeAnneesScolaires): string {
  const query = new URLSearchParams({
    idEcole: parametres.idEcole,
    page: String(parametres.page),
    taillePage: String(parametres.taillePage),
  });

  return `/api/annees-scolaires?${query.toString()}`;
}

function construireCheminAnneeActive(parametres: ParametresConsultationAnneeActive): string {
  const query = new URLSearchParams({
    idEcole: parametres.idEcole,
  });

  return `/api/annees-scolaires/active?${query.toString()}`;
}

export const anneesScolairesApi = {
  lister(
    parametres: ParametresListeAnneesScolaires,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeAnneesScolaires> {
    return referentielApi.obtenir<ReponseListeAnneesScolaires>(
      construireCheminAnneesScolaires(parametres),
      options,
    );
  },

  consulterActive(
    parametres: ParametresConsultationAnneeActive,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaireOptionnelle> {
    return referentielApi.obtenir<ReponseAnneeScolaireOptionnelle>(
      construireCheminAnneeActive(parametres),
      options,
    );
  },

  preparerSuivante(
    parametres: ParametresPreparationAnneeScolaireSuivante,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponsePreparationAnneeScolaire> {
    return referentielApi.envoyer<
      ParametresPreparationAnneeScolaireSuivante,
      ReponsePreparationAnneeScolaire
    >(
      '/api/annees-scolaires/preparer-suivante',
      parametres,
      options,
    );
  },
};
