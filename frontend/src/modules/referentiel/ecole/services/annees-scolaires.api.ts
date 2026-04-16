import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type { AnneeScolaireResume } from '../../commun/types/annees-scolaires.types';

export const anneesScolairesApi = {
  lister(options?: OptionsRequeteReferentiel): Promise<AnneeScolaireResume[]> {
    return referentielApi.obtenir<AnneeScolaireResume[]>('/api/annees-scolaires', options);
  },

  consulterActive(options?: OptionsRequeteReferentiel): Promise<AnneeScolaireResume> {
    return referentielApi.obtenir<AnneeScolaireResume>('/api/annees-scolaires/active', options);
  },
};
