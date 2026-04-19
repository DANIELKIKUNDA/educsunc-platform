import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ClasseAcademiqueResume,
  OptionEtudeResume,
  ReponseClassePedagogique,
  ReponseListeClassesAcademiques,
  ReponseListeClassesPedagogiques,
  ReponseListeOptionsEtudes,
} from '../../commun/types/structure-scolaire.types';

export interface ParametresListeClassesPedagogiques {
  idEcole: string;
  idAnneeScolaire: string;
  page?: number;
  taillePage?: number;
}

export interface ParametresPaginationStructure {
  page?: number;
  taillePage?: number;
}

export interface ParametresCreationClassePedagogique {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  code: string;
  libelle: string;
  creePar: string;
  suffixeParallele?: string;
  capaciteAccueil?: number;
}

export interface ParametresRenommageClassePedagogique {
  idClassePedagogique: string;
  nouveauLibelle: string;
  modifiePar: string;
}

export interface ParametresMutationClassePedagogique {
  idClassePedagogique: string;
  modifiePar: string;
}

function construireCheminClassesPedagogiques(
  parametres: ParametresListeClassesPedagogiques,
): string {
  const query = new URLSearchParams({
    idEcole: parametres.idEcole,
    idAnneeScolaire: parametres.idAnneeScolaire,
    page: String(parametres.page ?? 1),
    taillePage: String(parametres.taillePage ?? 20),
  });

  return `/api/classes-pedagogiques?${query.toString()}`;
}

function construireCheminPagine(
  chemin: string,
  parametres?: ParametresPaginationStructure,
): string {
  const query = new URLSearchParams({
    page: String(parametres?.page ?? 1),
    taillePage: String(parametres?.taillePage ?? 200),
  });

  return `${chemin}?${query.toString()}`;
}

export const structureScolaireApi = {
  async listerClassesAcademiques(
    parametres?: ParametresPaginationStructure,
    options?: OptionsRequeteReferentiel,
  ): Promise<ClasseAcademiqueResume[]> {
    const reponse = await referentielApi.obtenir<ReponseListeClassesAcademiques>(
      construireCheminPagine('/api/classes-academiques', parametres),
      options,
    );

    return reponse.donnees;
  },

  async listerOptionsEtudes(
    parametres?: ParametresPaginationStructure,
    options?: OptionsRequeteReferentiel,
  ): Promise<OptionEtudeResume[]> {
    const reponse = await referentielApi.obtenir<ReponseListeOptionsEtudes>(
      construireCheminPagine('/api/options-etudes', parametres),
      options,
    );

    return reponse.donnees;
  },

  listerClassesPedagogiques(
    parametres: ParametresListeClassesPedagogiques,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeClassesPedagogiques> {
    return referentielApi.obtenir<ReponseListeClassesPedagogiques>(
      construireCheminClassesPedagogiques(parametres),
      options,
    );
  },

  creerClassePedagogique(
    parametres: ParametresCreationClassePedagogique,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseClassePedagogique> {
    return referentielApi.envoyer<
      ParametresCreationClassePedagogique,
      ReponseClassePedagogique
    >(
      '/api/classes-pedagogiques',
      parametres,
      options,
    );
  },

  renommerClassePedagogique(
    parametres: ParametresRenommageClassePedagogique,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseClassePedagogique> {
    return referentielApi.modifier<
      Pick<ParametresRenommageClassePedagogique, 'nouveauLibelle' | 'modifiePar'>,
      ReponseClassePedagogique
    >(
      `/api/classes-pedagogiques/${parametres.idClassePedagogique}/renommer`,
      {
        nouveauLibelle: parametres.nouveauLibelle,
        modifiePar: parametres.modifiePar,
      },
      options,
    );
  },

  desactiverClassePedagogique(
    parametres: ParametresMutationClassePedagogique,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseClassePedagogique> {
    return referentielApi.envoyer<
      Pick<ParametresMutationClassePedagogique, 'modifiePar'>,
      ReponseClassePedagogique
    >(
      `/api/classes-pedagogiques/${parametres.idClassePedagogique}/desactiver`,
      { modifiePar: parametres.modifiePar },
      options,
    );
  },

  archiverClassePedagogique(
    parametres: ParametresMutationClassePedagogique,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseClassePedagogique> {
    return referentielApi.envoyer<
      Pick<ParametresMutationClassePedagogique, 'modifiePar'>,
      ReponseClassePedagogique
    >(
      `/api/classes-pedagogiques/${parametres.idClassePedagogique}/archiver`,
      { modifiePar: parametres.modifiePar },
      options,
    );
  },
};
