import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type { ProgrammeNiveauResume } from '../../commun/types/programmes-niveau.types';

export const programmesNiveauApi = {
  lister(options?: OptionsRequeteReferentiel): Promise<ProgrammeNiveauResume[]> {
    return referentielApi.obtenir<ProgrammeNiveauResume[]>('/api/programmes-niveau', options);
  },
};
