import type { RouteRecordRaw } from 'vue-router';

export const routesOrganisation: RouteRecordRaw[] = [
  {
    path: 'organisation',
    name: 'organization-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Organisation' },
  },
  {
    path: 'organisation/ecoles',
    name: 'organization-registry',
    component: () => import('./views/OrganizationRegistryView.vue'),
    meta: { title: 'Registre organisations et ecoles' },
  },
  {
    path: 'organisation/organisations/:idOrganisation',
    name: 'organization-detail',
    component: () => import('./views/OrganizationDetailView.vue'),
    meta: { title: 'Voir organisation' },
  },
  {
    path: 'organisation/organisations/:idOrganisation/ecoles',
    name: 'organization-attached-schools',
    component: () => import('./views/OrganizationAttachedSchoolsView.vue'),
    meta: { title: 'Ecoles rattachees' },
  },
  {
    path: 'organisation/organisations/:idOrganisation/modifier',
    name: 'organization-edit',
    component: () => import('./views/OrganizationEditView.vue'),
    meta: { title: 'Modifier organisation' },
  },
  {
    path: 'organisation/ecoles/:idEcole',
    name: 'organization-school-detail',
    redirect: (to) => ({
      name: 'school-administration-detail',
      params: { idEcole: to.params.idEcole },
      query: to.query,
    }),
    meta: { title: 'Detail ecole organisation' },
  },
  {
    path: 'organisation/configuration',
    name: 'organization-configuration',
    component: () => import('../configuration/views/ConfigurationCenterView.vue'),
    meta: { title: 'Configuration organisationnelle' },
  },
];
