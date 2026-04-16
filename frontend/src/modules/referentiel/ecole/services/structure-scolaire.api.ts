import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type {
  ClasseAcademiqueResume,
  ClassePedagogiqueResume,
  OptionEtudeResume,
} from '../../commun/types/structure-scolaire.types';

export const structureScolaireApi = {
  listerClassesAcademiques(options?: OptionsRequeteReferentiel): Promise<ClasseAcademiqueResume[]> {
    return referentielApi.obtenir<ClasseAcademiqueResume[]>('/api/classes-academiques', options);
  },

  listerOptionsEtudes(options?: OptionsRequeteReferentiel): Promise<OptionEtudeResume[]> {
    return referentielApi.obtenir<OptionEtudeResume[]>('/api/options-etudes', options);
  },

  listerClassesPedagogiques(options?: OptionsRequeteReferentiel): Promise<ClassePedagogiqueResume[]> {
    return referentielApi.obtenir<ClassePedagogiqueResume[]>('/api/classes-pedagogiques', options);
  },
};
