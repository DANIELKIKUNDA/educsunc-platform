import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ReponseEtatLocalProgrammeNiveau,
  ReponseListeProgrammesNiveau,
  ReponseProgrammeNiveau,
} from '../../commun/types/programmes-niveau.types';

export interface ParametresListeProgrammesNiveau {
  idEcole: string;
  idAnneeScolaire: string;
  page?: number;
  taillePage?: number;
}

export interface ParametresInitialisationProgrammeNiveau {
  idEcole: string;
  idAnneeScolaire: string;
  idClasseAcademique: string;
  idReferentielProgramme: string;
  idVersionReferentielProgramme: string;
  creePar: string;
}

export interface ParametresConsultationProgrammeNiveau {
  idProgrammeNiveau: string;
}

export interface ParametresValidationProgrammeNiveau {
  idProgrammeNiveau: string;
  validePar: string;
}

export interface ParametresArchivageProgrammeNiveau {
  idProgrammeNiveau: string;
  archivePar: string;
}

function construireCheminListe(parametres: ParametresListeProgrammesNiveau): string {
  const query = new URLSearchParams({
    idEcole: parametres.idEcole,
    idAnneeScolaire: parametres.idAnneeScolaire,
    page: String(parametres.page ?? 1),
    taillePage: String(parametres.taillePage ?? 20),
  });

  return `/api/programmes-niveau?${query.toString()}`;
}

export const programmesNiveauApi = {
  lister(
    parametres: ParametresListeProgrammesNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseListeProgrammesNiveau> {
    return referentielApi.obtenir<ReponseListeProgrammesNiveau>(
      construireCheminListe(parametres),
      options,
    );
  },

  consulter(
    parametres: ParametresConsultationProgrammeNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseProgrammeNiveau> {
    return referentielApi.obtenir<ReponseProgrammeNiveau>(
      `/api/programmes-niveau/${parametres.idProgrammeNiveau}`,
      options,
    );
  },

  produireEtatLocal(
    parametres: ParametresConsultationProgrammeNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseEtatLocalProgrammeNiveau> {
    return referentielApi.obtenir<ReponseEtatLocalProgrammeNiveau>(
      `/api/programmes-niveau/${parametres.idProgrammeNiveau}/etat-local`,
      options,
    );
  },

  initialiser(
    parametres: ParametresInitialisationProgrammeNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseProgrammeNiveau> {
    return referentielApi.envoyer<
      ParametresInitialisationProgrammeNiveau,
      ReponseProgrammeNiveau
    >(
      '/api/programmes-niveau/initialiser',
      parametres,
      options,
    );
  },

  valider(
    parametres: ParametresValidationProgrammeNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseProgrammeNiveau> {
    return referentielApi.envoyer<
      Pick<ParametresValidationProgrammeNiveau, 'validePar'>,
      ReponseProgrammeNiveau
    >(
      `/api/programmes-niveau/${parametres.idProgrammeNiveau}/valider`,
      { validePar: parametres.validePar },
      options,
    );
  },

  archiver(
    parametres: ParametresArchivageProgrammeNiveau,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseProgrammeNiveau> {
    return referentielApi.envoyer<
      Pick<ParametresArchivageProgrammeNiveau, 'archivePar'>,
      ReponseProgrammeNiveau
    >(
      `/api/programmes-niveau/${parametres.idProgrammeNiveau}/archiver`,
      { archivePar: parametres.archivePar },
      options,
    );
  },
};
