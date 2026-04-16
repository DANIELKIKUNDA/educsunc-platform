import { referentielApi, type OptionsRequeteReferentiel } from '../../commun/services/referentiel.api';
import type { MigrationReferentielResume } from '../../commun/types/migrations-referentiel.types';

export const migrationsReferentielApi = {
  consulter(id: string, options?: OptionsRequeteReferentiel): Promise<MigrationReferentielResume> {
    return referentielApi.obtenir<MigrationReferentielResume>(`/api/migrations-referentiel/${id}`, options);
  },
};
