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
    path: 'organisation/ecoles/:idEcole',
    name: 'organization-school-detail',
    component: () => import('./views/OrganizationSchoolDetailView.vue'),
    meta: { title: 'Detail ecole organisation' },
  },
  {
    path: 'organisation/configuration',
    name: 'organization-configuration',
    component: () => import('../configuration/views/ConfigurationOrganizationView.vue'),
    meta: { title: 'Configuration organisationnelle' },
  },
];
