import type { RouteRecordRaw } from 'vue-router';

export const routesConfiguration: RouteRecordRaw[] = [
  {
    path: 'configuration',
    name: 'configuration-home',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Configuration' },
  },
  {
    path: 'configuration/plateforme/runtime',
    name: 'configuration-platform-runtime',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Runtime plateforme' },
  },
  {
    path: 'configuration/organisation',
    name: 'configuration-organization',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Configuration organisationnelle' },
  },
  {
    path: 'configuration/organisation/modules',
    name: 'configuration-organization-modules',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Modules organisation' },
  },
  {
    path: 'configuration/ecole/modules',
    name: 'configuration-school-modules',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Modules ecole' },
  },
  {
    path: 'configuration/ecole/branding',
    name: 'configuration-school-branding',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Branding ecole' },
  },
  {
    path: 'configuration/ecole/notifications',
    name: 'configuration-school-notifications',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Notifications ecole' },
  },
  {
    path: 'configuration/utilisateur/preferences',
    name: 'configuration-user-preferences',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Preferences utilisateur' },
  },
  {
    path: 'moi/preferences',
    name: 'me-preferences',
    component: () => import('./views/ConfigurationCenterView.vue'),
    meta: { title: 'Mes preferences' },
  },
];
