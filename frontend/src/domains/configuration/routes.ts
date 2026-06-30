import type { RouteRecordRaw } from 'vue-router';
import ModuleHomeView from './views/ModuleHomeView.vue';

export const routesConfiguration: RouteRecordRaw[] = [
  {
    path: 'configuration',
    name: 'configuration-home',
    component: ModuleHomeView,
    meta: { title: 'Configuration' },
  },
  {
    path: 'configuration/plateforme/runtime',
    name: 'configuration-platform-runtime',
    component: () => import('./views/ConfigurationWorkspaceView.vue'),
    props: {
      screenCode: 'SCR-CFG-001',
      title: 'Configuration runtime plateforme',
      description: 'Pilotage des configurations runtime globales au niveau SYSTEM.',
      scopeLevel: 'SYSTEM',
      keyPrefixDefault: 'runtime.',
      defaultKey: 'runtime.scheduler.refreshMs',
      valuePlaceholder: '60000',
      allowDelete: true,
      allowLock: true,
      allowSnapshots: true,
      allowPropagate: true,
      allowReload: true,
    },
    meta: { title: 'Runtime plateforme' },
  },
  {
    path: 'configuration/organisation',
    name: 'configuration-organization',
    component: () => import('./views/ConfigurationOrganizationView.vue'),
    meta: { title: 'Configuration organisationnelle' },
  },
  {
    path: 'configuration/organisation/modules',
    name: 'configuration-organization-modules',
    component: () => import('./views/ConfigurationOrganizationView.vue'),
    meta: { title: 'Modules organisation' },
  },
  {
    path: 'configuration/ecole/modules',
    name: 'configuration-school-modules',
    component: () => import('./views/ConfigurationSchoolModulesView.vue'),
    meta: { title: 'Modules ecole' },
  },
  {
    path: 'configuration/ecole/branding',
    name: 'configuration-school-branding',
    component: () => import('./views/ConfigurationSchoolBrandingView.vue'),
    meta: { title: 'Branding ecole' },
  },
  {
    path: 'configuration/ecole/notifications',
    name: 'configuration-school-notifications',
    component: () => import('./views/ConfigurationSchoolNotificationsView.vue'),
    meta: { title: 'Notifications ecole' },
  },
  {
    path: 'configuration/utilisateur/preferences',
    name: 'configuration-user-preferences',
    component: () => import('./views/ConfigurationUserPreferencesView.vue'),
    meta: { title: 'Preferences utilisateur' },
  },
  {
    path: 'moi/preferences',
    name: 'me-preferences',
    component: () => import('./views/ConfigurationUserPreferencesView.vue'),
    meta: { title: 'Mes preferences' },
  },
];
