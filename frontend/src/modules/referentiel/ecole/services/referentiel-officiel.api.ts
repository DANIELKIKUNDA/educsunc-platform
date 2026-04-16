import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type { ReferentielProgrammeResume } from '../../commun/types/referentiel-officiel.types';

export const referentielOfficielApi = {
  listerProgrammes(options?: OptionsRequeteReferentiel): Promise<ReferentielProgrammeResume[]> {
    return referentielApi.obtenir<ReferentielProgrammeResume[]>('/api/referentiels/programmes', options);
  },
};
