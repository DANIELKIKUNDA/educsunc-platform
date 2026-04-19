import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ReponseAnneeScolaire,
  ReponseAnneeScolaireOptionnelle,
  ReponseBasculeAnneeScolaire,
  ReponseGarantieAnneeActive,
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

export interface ParametresCreationAnneeScolaire {
  idEcole: string;
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  creePar: string;
}

export interface ParametresPreparationAnneeScolaireSuivante {
  idEcole: string;
  creePar: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ParametresGarantieAnneeActive {
  idEcole: string;
  modifiePar: string;
  dateReference?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ParametresBasculeAnneeScolaire {
  idEcole: string;
  modifiePar: string;
  creerSuivanteSiAbsente?: boolean;
  dateDebutSuivante?: string;
  dateFinSuivante?: string;
}

export interface ParametresMutationAnneeScolaire {
  idAnneeScolaire: string;
  modifiePar: string;
}

export interface ParametresModificationAnneeScolaire extends ParametresMutationAnneeScolaire {
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

export interface ParametresConsultationAnneeScolaire {
  idAnneeScolaire: string;
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
  creer(
    parametres: ParametresCreationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.envoyer<
      ParametresCreationAnneeScolaire,
      ReponseAnneeScolaire
    >(
      '/api/annees-scolaires',
      parametres,
      options,
    );
  },

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

  consulter(
    parametres: ParametresConsultationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.obtenir<ReponseAnneeScolaire>(
      `/api/annees-scolaires/${parametres.idAnneeScolaire}`,
      options,
    );
  },

  modifier(
    parametres: ParametresModificationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.modifier<
      Omit<ParametresModificationAnneeScolaire, 'idAnneeScolaire'>,
      ReponseAnneeScolaire
    >(
      `/api/annees-scolaires/${parametres.idAnneeScolaire}`,
      {
        code: parametres.code,
        libelle: parametres.libelle,
        dateDebut: parametres.dateDebut,
        dateFin: parametres.dateFin,
        modifiePar: parametres.modifiePar,
      },
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

  garantirActive(
    parametres: ParametresGarantieAnneeActive,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseGarantieAnneeActive> {
    return referentielApi.envoyer<
      ParametresGarantieAnneeActive,
      ReponseGarantieAnneeActive
    >(
      '/api/annees-scolaires/garantir-active',
      parametres,
      options,
    );
  },

  basculer(
    parametres: ParametresBasculeAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseBasculeAnneeScolaire> {
    return referentielApi.envoyer<
      ParametresBasculeAnneeScolaire,
      ReponseBasculeAnneeScolaire
    >(
      '/api/annees-scolaires/basculer',
      parametres,
      options,
    );
  },

  cloturer(
    parametres: ParametresMutationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.envoyer<
      Pick<ParametresMutationAnneeScolaire, 'modifiePar'>,
      ReponseAnneeScolaire
    >(
      `/api/annees-scolaires/${parametres.idAnneeScolaire}/cloturer`,
      { modifiePar: parametres.modifiePar },
      options,
    );
  },

  activer(
    parametres: ParametresMutationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.envoyer<
      Pick<ParametresMutationAnneeScolaire, 'modifiePar'>,
      ReponseAnneeScolaire
    >(
      `/api/annees-scolaires/${parametres.idAnneeScolaire}/activer`,
      { modifiePar: parametres.modifiePar },
      options,
    );
  },

  archiver(
    parametres: ParametresMutationAnneeScolaire,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseAnneeScolaire> {
    return referentielApi.envoyer<
      Pick<ParametresMutationAnneeScolaire, 'modifiePar'>,
      ReponseAnneeScolaire
    >(
      `/api/annees-scolaires/${parametres.idAnneeScolaire}/archiver`,
      { modifiePar: parametres.modifiePar },
      options,
    );
  },
};
