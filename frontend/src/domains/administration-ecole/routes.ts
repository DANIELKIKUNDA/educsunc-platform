import type { RouteRecordRaw } from 'vue-router';

export const routesAdministrationEcole: RouteRecordRaw[] = [
  {
    path: 'administration-ecole',
    name: 'school-administration-home',
    component: () => import('./views/ModuleHomeView.vue'),
    meta: { title: 'Administration ecole' },
  },
  {
    path: 'administration-ecole/ecoles',
    name: 'school-administration-registry',
    component: () => import('./views/SchoolAdministrationRegistryView.vue'),
    meta: { title: 'Registre des ecoles' },
  },
  {
    path: 'administration-ecole/ecoles/:idEcole',
    name: 'school-administration-detail',
    component: () => import('./views/SchoolAdministrationDetailView.vue'),
    meta: { title: 'Detail ecole' },
  },
];
