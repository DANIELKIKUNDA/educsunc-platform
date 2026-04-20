import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  PeriodeCalendrierCreation,
  ReponseCalendrierAcademique,
  ReponseCalendrierAcademiqueOptionnel,
  TypeStructureEvaluationCalendrier,
} from '../../commun/types/calendriers-academiques.types';

export interface ParametresCreationCalendrier {
  idEcole: string;
  idAnneeScolaire: string;
  typeStructureEvaluation: TypeStructureEvaluationCalendrier;
  dateDebutAnnee: string;
  dateFinAnnee: string;
  periodes: PeriodeCalendrierCreation[];
  creePar: string;
}

export interface ParametresConsultationCalendrierParEcoleEtAnnee {
  idEcole: string;
  idAnneeScolaire: string;
}

export interface ParametresConsultationCalendrier {
  idCalendrierAcademique: string;
}

export interface ParametresValidationCalendrier {
  idCalendrierAcademique: string;
  validePar: string;
}

export interface ParametresVerrouillageCalendrier {
  idCalendrierAcademique: string;
  verrouillePar: string;
}

function construireCheminCalendrierParEcoleEtAnnee(
  parametres: ParametresConsultationCalendrierParEcoleEtAnnee,
): string {
  const query = new URLSearchParams({
    idEcole: parametres.idEcole,
    idAnneeScolaire: parametres.idAnneeScolaire,
  });

  return `/api/calendriers-academiques?${query.toString()}`;
}

export const calendriersAcademiquesApi = {
  creer(
    parametres: ParametresCreationCalendrier,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseCalendrierAcademique> {
    return referentielApi.envoyer<ParametresCreationCalendrier, ReponseCalendrierAcademique>(
      '/api/calendriers-academiques',
      parametres,
      options,
    );
  },

  consulterParEcoleEtAnnee(
    parametres: ParametresConsultationCalendrierParEcoleEtAnnee,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseCalendrierAcademiqueOptionnel> {
    return referentielApi.obtenir<ReponseCalendrierAcademiqueOptionnel>(
      construireCheminCalendrierParEcoleEtAnnee(parametres),
      options,
    );
  },

  consulter(
    parametres: ParametresConsultationCalendrier,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseCalendrierAcademique> {
    return referentielApi.obtenir<ReponseCalendrierAcademique>(
      `/api/calendriers-academiques/${parametres.idCalendrierAcademique}`,
      options,
    );
  },

  valider(
    parametres: ParametresValidationCalendrier,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseCalendrierAcademique> {
    return referentielApi.envoyer<
      Pick<ParametresValidationCalendrier, 'validePar'>,
      ReponseCalendrierAcademique
    >(
      `/api/calendriers-academiques/${parametres.idCalendrierAcademique}/valider`,
      { validePar: parametres.validePar },
      options,
    );
  },

  verrouiller(
    parametres: ParametresVerrouillageCalendrier,
    options?: OptionsRequeteReferentiel,
  ): Promise<ReponseCalendrierAcademique> {
    return referentielApi.envoyer<
      Pick<ParametresVerrouillageCalendrier, 'verrouillePar'>,
      ReponseCalendrierAcademique
    >(
      `/api/calendriers-academiques/${parametres.idCalendrierAcademique}/verrouiller`,
      { verrouillePar: parametres.verrouillePar },
      options,
    );
  },
};
