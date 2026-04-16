import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type { CalendrierAcademiqueResume } from '../../commun/types/calendriers-academiques.types';

export const calendriersAcademiquesApi = {
  consulter(id: string, options?: OptionsRequeteReferentiel): Promise<CalendrierAcademiqueResume> {
    return referentielApi.obtenir<CalendrierAcademiqueResume>(`/api/calendriers-academiques/${id}`, options);
  },
};
