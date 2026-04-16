import type { RouteRecordRaw } from 'vue-router';
import LayoutAdmin from '../../../../layouts/LayoutAdmin.vue';
import TableauBordReferentielPage from '../pages/TableauBordReferentielPage.vue';
import AnneesScolairesPage from '../pages/annees/AnneesScolairesPage.vue';
import CalendriersAcademiquesPage from '../pages/calendriers/CalendriersAcademiquesPage.vue';
import ClassesPedagogiquesPage from '../pages/classes-pedagogiques/ClassesPedagogiquesPage.vue';
import MaintenanceReferentielPage from '../pages/maintenance/MaintenanceReferentielPage.vue';
import ReferentielOfficielPage from '../pages/officiel/ReferentielOfficielPage.vue';
import ProgrammesNiveauPage from '../pages/programmes-niveau/ProgrammesNiveauPage.vue';

export const routesReferentielEcole: RouteRecordRaw[] = [
  {
    path: '/referentiel/ecole',
    component: LayoutAdmin,
    children: [
      {
        path: '',
        name: 'referentiel-ecole-tableau-bord',
        component: TableauBordReferentielPage,
      },
      {
        path: 'annees',
        name: 'referentiel-ecole-annees',
        component: AnneesScolairesPage,
      },
      {
        path: 'officiel',
        name: 'referentiel-ecole-officiel',
        component: ReferentielOfficielPage,
      },
      {
        path: 'classes-pedagogiques',
        name: 'referentiel-ecole-classes-pedagogiques',
        component: ClassesPedagogiquesPage,
      },
      {
        path: 'programmes-niveau',
        name: 'referentiel-ecole-programmes-niveau',
        component: ProgrammesNiveauPage,
      },
      {
        path: 'calendriers',
        name: 'referentiel-ecole-calendriers',
        component: CalendriersAcademiquesPage,
      },
      {
        path: 'maintenance',
        name: 'referentiel-ecole-maintenance',
        component: MaintenanceReferentielPage,
      },
    ],
  },
];
