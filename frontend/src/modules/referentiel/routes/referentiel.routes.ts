import type { RouteRecordRaw } from 'vue-router';
import { routesReferentielEcole } from '../ecole/routes/referentiel-ecole.routes';
import { routesReferentielOrganisation } from '../organisation/routes/referentiel-organisation.routes';
import { routesReferentielPlateforme } from '../plateforme/routes/referentiel-plateforme.routes';

export const routesReferentiel: RouteRecordRaw[] = [
  ...routesReferentielPlateforme,
  ...routesReferentielOrganisation,
  ...routesReferentielEcole,
];
