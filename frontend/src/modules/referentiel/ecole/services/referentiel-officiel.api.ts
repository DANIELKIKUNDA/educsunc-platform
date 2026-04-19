import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ReponseListeReferentielsCours,
  ReponseListeReferentielsProgrammes,
  ReponseReferentielProgramme,
} from '../../commun/types/referentiel-officiel.types';

export interface ParametresListeReferentielsProgrammes {
  idClasseAcademique: string;
  page?: number;
  taillePage?: number;
}

export interface ParametresConsultationReferentielProgramme {
  idReferentielProgramme: string;
}

export interface ParametresListeReferentielsCours {
  page?: number;
  taillePage?: number;
}

function construireCheminListeProgrammes(parametres: ParametresListeReferentielsProgrammes): string {
  const query = new URLSearchParams({
    idClasseAcademique: parametres.idClasseAcademique,
    page: String(parametres.page ?? 1),
    taillePage: String(parametres.taillePage ?? 20),
  });

  return `/api/referentiels/programmes?${query.toString()}`;
}

function construireCheminListeCours(parametres: ParametresListeReferentielsCours): string {
  const query = new URLSearchParams({
    page: String(parametres.page ?? 1),
    taillePage: String(parametres.taillePage ?? 500),
  });

  return `/api/referentiels/cours?${query.toString()}`;
}

export const referentielOfficielApi = {
  listerProgrammes(
    parametres: ParametresListeReferentielsProgrammes,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeReferentielsProgrammes> {
    return referentielApi.obtenir<ReponseListeReferentielsProgrammes>(
      construireCheminListeProgrammes(parametres),
      options,
    );
  },

  consulterProgramme(
    parametres: ParametresConsultationReferentielProgramme,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseReferentielProgramme> {
    return referentielApi.obtenir<ReponseReferentielProgramme>(
      `/api/referentiels/programmes/${parametres.idReferentielProgramme}`,
      options,
    );
  },

  listerCours(
    parametres: ParametresListeReferentielsCours = {},
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeReferentielsCours> {
    return referentielApi.obtenir<ReponseListeReferentielsCours>(
      construireCheminListeCours(parametres),
      options,
    );
  },
};
